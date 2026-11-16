/* Interface : un seul objet d'état, un rendu complet par écran, des actions déléguées. */
(function () {
  'use strict';

  var G = window.Game;
  var THEMES = window.THEMES;
  var STORE_KEY = 'sous-couverture:v1';
  var NAME_MAX = 16;
  var GAME_SCREENS = ['deal', 'round', 'vote', 'reveal', 'end'];
  var DEFAULT_THEMES = ['facile', 'cuisine', 'animaux', 'quotidien'];

  var $app = document.getElementById('app');
  var $overlay = document.getElementById('overlay');

  var state = defaultState();
  var ui = { sheet: null, error: '', returnKey: null };
  var lastScreen = null;

  var ROLE = {
    civil: { label: 'Civil', plural: 'Civils' },
    under: { label: 'Undercover', plural: 'Undercover' },
    blank: { label: 'Page Blanche', plural: 'Pages Blanches' }
  };

  /* ---------- utilitaires ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function plural(n, one, many) { return n + ' ' + (n > 1 ? many : one); }

  function themeById(id) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
    return null;
  }

  function displayName(p, index) {
    var n = String(p.name || '').trim();
    return n || 'Joueur ' + (index + 1);
  }

  function defaultState() {
    var players = [];
    for (var i = 1; i <= 5; i++) players.push({ id: i, name: '', score: 0 });
    return {
      screen: 'home', players: players, nextId: 6,
      under: 1, blank: 1, themes: DEFAULT_THEMES.slice(), used: [], game: null
    };
  }

  /* Ne fait confiance à rien de ce qui revient du stockage. */
  function sanitize(raw) {
    var s = defaultState();
    if (!raw || typeof raw !== 'object') return s;
    if (Array.isArray(raw.players) && raw.players.length >= G.MIN_PLAYERS) {
      var seen = {};
      var players = [];
      raw.players.slice(0, G.MAX_PLAYERS).forEach(function (p) {
        var id = Number(p && p.id);
        if (!isFinite(id) || seen[id]) return;
        seen[id] = true;
        players.push({
          id: id,
          name: String((p && p.name) || '').slice(0, NAME_MAX),
          score: Math.max(0, Math.floor(Number(p && p.score)) || 0)
        });
      });
      if (players.length >= G.MIN_PLAYERS) s.players = players;
    }
    s.nextId = s.players.reduce(function (m, p) { return Math.max(m, p.id); }, 0) + 1;
    var counts = G.clampCounts(s.players.length, raw.under, raw.blank);
    s.under = counts.under;
    s.blank = counts.blank;
    if (Array.isArray(raw.themes)) {
      s.themes = raw.themes.filter(function (id) { return !!themeById(id); });
    }
    if (Array.isArray(raw.used)) s.used = raw.used.filter(function (k) { return typeof k === 'string'; });
    if (isValidGame(raw.game) && GAME_SCREENS.indexOf(raw.screen) !== -1) {
      s.game = raw.game;
      s.game.shown = false; /* après un rechargement, aucun mot ne reste affiché */
      s.screen = raw.screen;
    } else if (raw.screen === 'setup' || raw.screen === 'rules') {
      s.screen = raw.screen;
    }
    return s;
  }

  function isValidGame(g) {
    if (!g || typeof g !== 'object') return false;
    if (!Array.isArray(g.order) || !Array.isArray(g.alive) || !g.roles || !g.names) return false;
    if (typeof g.civilWord !== 'string' || typeof g.underWord !== 'string') return false;
    if (!g.startCounts || !themeById(g.themeId)) return false;
    return g.order.every(function (id) { return ROLE[g.roles[id]] && typeof g.names[id] === 'string'; });
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible : on joue sans */ }
  }

  function load() {
    try { return sanitize(JSON.parse(localStorage.getItem(STORE_KEY))); } catch (e) { return defaultState(); }
  }

  /* ---------- rendu ---------- */

  function render() {
    var active = document.activeElement;
    var fkey = active && active.dataset ? active.dataset.fkey : null;
    var changed = state.screen !== lastScreen;

    $app.dataset.screen = state.screen;
    $app.innerHTML = SCREENS[state.screen]();
    renderOverlay();

    if (changed) {
      window.scrollTo(0, 0);
      var h = $app.querySelector('h1');
      if (h && lastScreen !== null) h.focus({ preventScroll: true });
    } else if (fkey && !ui.sheet) {
      var el = $app.querySelector('[data-fkey="' + fkey.replace(/"/g, '') + '"]');
      if (el) el.focus({ preventScroll: true });
    }
    lastScreen = state.screen;
    save();
  }

  function badge(role) {
    return '<span class="badge badge--' + role + '">' + ROLE[role].label + '</span>';
  }

  function pips(counts) {
    var out = '';
    ['civil', 'under', 'blank'].forEach(function (r) {
      for (var i = 0; i < counts[r]; i++) out += '<i class="pip pip--' + r + '"></i>';
    });
    return '<div class="pips" aria-hidden="true">' + out + '</div>';
  }

  var SCREENS = {};

  SCREENS.home = function () {
    return '' +
      '<header class="hero">' +
        '<p class="eyebrow">Jeu de mots et de bluff · 3 à 20 joueurs</p>' +
        '<h1 class="brand" tabindex="-1">Sous<br>Couverture</h1>' +
        '<p class="lead">Chacun reçoit un mot secret. Trouvez qui n\'a pas le même que vous, sans vous trahir.</p>' +
      '</header>' +
      '<ul class="trio">' +
        '<li class="trio__card trio__card--civil"><strong>Civil</strong><span>Le mot de la majorité.</span></li>' +
        '<li class="trio__card trio__card--under"><strong>Undercover</strong><span>Un mot voisin, sans le savoir.</span></li>' +
        '<li class="trio__card trio__card--blank"><strong>Page Blanche</strong><span>Aucun mot. Tout au bluff.</span></li>' +
      '</ul>' +
      '<p class="note">Un seul téléphone suffit : il passe de main en main.</p>' +
      '<div class="bar">' +
        '<button class="btn btn--primary" data-act="go" data-arg="setup">Nouvelle partie</button>' +
        '<button class="btn" data-act="go" data-arg="rules">Règles du jeu</button>' +
      '</div>';
  };

  SCREENS.rules = function () {
    return '' +
      '<header class="top"><button class="link" data-act="go" data-arg="home">Retour</button></header>' +
      '<h1 class="title" tabindex="-1">Règles du jeu</h1>' +
      '<ol class="rules">' +
        '<li><h2>Les mots</h2><p>Chaque joueur découvre son mot en secret. Les Civils ont tous le même. Les Undercover ont un mot proche, et personne ne sait d\'avance dans quel camp il est. La Page Blanche n\'a aucun mot.</p></li>' +
        '<li><h2>Les indices</h2><p>À tour de rôle, chacun dit un seul mot en rapport avec le sien. Trop précis, il aide les infiltrés. Trop vague, il rend suspect.</p></li>' +
        '<li><h2>Le vote</h2><p>Après le tour de table, on débat puis on vote à main levée. Le joueur le plus désigné est éliminé et son rôle est révélé. En cas d\'égalité, on revote entre les ex æquo.</p></li>' +
        '<li><h2>La dernière chance</h2><p>Une Page Blanche éliminée peut tenter de deviner le mot des Civils. Si elle trouve, elle gagne seule.</p></li>' +
        '<li><h2>La victoire</h2><p>Les Civils gagnent quand tous les Undercover et toutes les Pages Blanches sont éliminés. Les infiltrés gagnent dès qu\'il ne reste qu\'un seul Civil.</p></li>' +
      '</ol>' +
      '<section class="panel"><h2 class="panel__title">Points</h2>' +
        '<dl class="points">' +
          '<div><dt>Civil vainqueur</dt><dd>+' + G.POINTS.civil + '</dd></div>' +
          '<div><dt>Undercover vainqueur</dt><dd>+' + G.POINTS.under + '</dd></div>' +
          '<div><dt>Page Blanche vainqueur</dt><dd>+' + G.POINTS.blank + '</dd></div>' +
          '<div><dt>Page Blanche qui devine le mot</dt><dd>+' + G.POINTS.blankGuess + '</dd></div>' +
        '</dl></section>' +
      '<div class="bar"><button class="btn btn--primary" data-act="go" data-arg="setup">Nouvelle partie</button></div>';
  };

  SCREENS.setup = function () {
    var n = state.players.length;
    var c = G.clampCounts(n, state.under, state.blank);
    var maxInf = n - G.MIN_CIVILS;
    var total = c.under + c.blank;
    var hasScores = state.players.some(function (p) { return p.score > 0; });

    var rows = state.players.map(function (p, i) {
      return '<li class="player">' +
        '<span class="player__n">' + (i + 1) + '</span>' +
        '<input class="input" id="name-' + p.id + '" data-input="name" data-id="' + p.id + '" data-fkey="name-' + p.id + '"' +
          ' value="' + esc(p.name) + '" placeholder="Joueur ' + (i + 1) + '" maxlength="' + NAME_MAX + '"' +
          ' autocomplete="off" autocapitalize="words" enterkeyhint="done" aria-label="Nom du joueur ' + (i + 1) + '">' +
        (p.score > 0 ? '<span class="player__score">' + p.score + ' pts</span>' : '') +
        '<button class="icon" data-act="player-remove" data-arg="' + p.id + '" data-fkey="rm-' + p.id + '"' +
          (n <= G.MIN_PLAYERS ? ' disabled' : '') + ' aria-label="Retirer ' + esc(displayName(p, i)) + '">×</button>' +
      '</li>';
    }).join('');

    function stepper(role, value, canDec, canInc, hint) {
      return '<div class="role role--' + role + '">' +
        '<div class="role__text"><strong>' + ROLE[role].plural + '</strong><span>' + hint + '</span></div>' +
        '<div class="stepper">' +
          '<button class="step" data-act="count" data-arg="' + role + ':-1" data-fkey="' + role + '-dec"' + (canDec ? '' : ' disabled') + ' aria-label="Moins de ' + ROLE[role].plural + '">−</button>' +
          '<output class="step__val" aria-live="polite">' + value + '</output>' +
          '<button class="step" data-act="count" data-arg="' + role + ':1" data-fkey="' + role + '-inc"' + (canInc ? '' : ' disabled') + ' aria-label="Plus de ' + ROLE[role].plural + '">+</button>' +
        '</div></div>';
    }

    var chips = THEMES.map(function (t) {
      var on = state.themes.indexOf(t.id) !== -1;
      return '<button class="chip" data-act="theme" data-arg="' + t.id + '" data-fkey="th-' + t.id + '" aria-pressed="' + on + '">' +
        '<span class="chip__name">' + esc(t.name) + '</span>' +
        '<span class="chip__desc">' + esc(t.desc) + '</span>' +
        '<span class="chip__n">' + t.pairs.length + ' paires</span></button>';
    }).join('');

    var pairCount = THEMES.reduce(function (sum, t) {
      return sum + (state.themes.indexOf(t.id) !== -1 ? t.pairs.length : 0);
    }, 0);

    return '' +
      '<header class="top"><button class="link" data-act="go" data-arg="home">Accueil</button></header>' +
      '<h1 class="title" tabindex="-1">Nouvelle partie</h1>' +

      '<section class="panel">' +
        '<div class="panel__head"><h2 class="panel__title">Joueurs</h2><span class="count">' + n + '</span></div>' +
        '<ul class="players">' + rows + '</ul>' +
        '<div class="row">' +
          '<button class="btn btn--small" data-act="player-add" data-fkey="add"' + (n >= G.MAX_PLAYERS ? ' disabled' : '') + '>Ajouter un joueur</button>' +
          (hasScores ? '<button class="link" data-act="scores-reset" data-fkey="scores-reset">Remettre les scores à zéro</button>' : '') +
        '</div>' +
      '</section>' +

      '<section class="panel">' +
        '<div class="panel__head"><h2 class="panel__title">Rôles</h2></div>' +
        pips(c) +
        '<div class="role role--civil"><div class="role__text"><strong>Civils</strong><span>Les joueurs restants</span></div>' +
          '<output class="role__fixed" aria-live="polite">' + c.civil + '</output></div>' +
        stepper('under', c.under, total > 1 && c.under > 0, total < maxInf, 'Reçoivent le mot voisin') +
        stepper('blank', c.blank, total > 1 && c.blank > 0, total < maxInf, 'Ne reçoivent aucun mot') +
        '<div class="row">' +
          '<button class="btn btn--small" data-act="preset" data-arg="reco" data-fkey="p-reco">Répartition conseillée</button>' +
          '<button class="btn btn--small" data-act="preset" data-arg="half" data-fkey="p-half">Moitié Undercover</button>' +
        '</div>' +
        '<p class="hint">Répartition libre : il faut au moins 2 Civils et 1 infiltré. Les Undercover peuvent être aussi nombreux que les Civils, ou plus.</p>' +
      '</section>' +

      '<section class="panel">' +
        '<div class="panel__head"><h2 class="panel__title">Thèmes</h2><span class="count">' + pairCount + ' paires</span></div>' +
        '<div class="chips">' + chips + '</div>' +
        '<div class="row">' +
          '<button class="link" data-act="themes-all" data-fkey="th-all">Tout cocher</button>' +
          '<button class="link" data-act="themes-none" data-fkey="th-none">Tout décocher</button>' +
        '</div>' +
      '</section>' +

      '<div class="bar">' +
        '<p class="error" id="setup-error" role="alert"' + (ui.error ? '' : ' hidden') + '>' + esc(ui.error) + '</p>' +
        '<button class="btn btn--primary" data-act="start" data-fkey="start">Distribuer les mots</button>' +
      '</div>';
  };

  function secretCard(g, id, shown, act) {
    var role = g.roles[id];
    if (!shown) {
      return '<button class="secret secret--back" data-act="' + act + '" data-fkey="secret" aria-label="Révéler le mot de ' + esc(g.names[id]) + '">' +
        '<span class="secret__label">Pour</span>' +
        '<span class="secret__name">' + esc(g.names[id]) + '</span>' +
        '<span class="secret__cta">Touche la carte quand tu es seul à voir l\'écran</span>' +
      '</button>';
    }
    if (role === 'blank') {
      return '<div class="secret secret--front secret--blank">' +
        '<span class="secret__label">' + esc(g.names[id]) + ', tu es</span>' +
        '<span class="secret__word">Page Blanche</span>' +
        '<span class="secret__cta">Tu n\'as pas de mot. Écoute les indices, bluffe, et devine le mot des Civils.</span>' +
      '</div>';
    }
    var word = role === 'under' ? g.underWord : g.civilWord;
    return '<div class="secret secret--front">' +
      '<span class="secret__label">' + esc(g.names[id]) + ', ton mot secret</span>' +
      '<span class="secret__word' + (word.length > 14 ? ' secret__word--long' : '') + '">' + esc(word) + '</span>' +
      '<span class="secret__cta">Retiens-le. Tu ne sais pas encore si tu es Civil ou Undercover.</span>' +
    '</div>';
  }

  SCREENS.deal = function () {
    var g = state.game;
    var id = g.order[g.dealIdx];
    var last = g.dealIdx === g.order.length - 1;
    return '' +
      '<header class="top"><span class="step-label">Distribution · ' + (g.dealIdx + 1) + ' / ' + g.order.length + '</span>' +
        '<button class="link" data-act="quit" data-fkey="quit">Quitter</button></header>' +
      '<h1 class="title title--center" tabindex="-1">' + (g.shown ? 'Mémorise, puis cache' : 'Passe le téléphone à ' + esc(g.names[id])) + '</h1>' +
      '<div class="stage">' + secretCard(g, id, g.shown, 'deal-show') + '</div>' +
      '<div class="bar">' +
        (g.shown
          ? '<button class="btn btn--primary" data-act="deal-next" data-fkey="deal-next">' + (last ? 'Cacher et commencer' : 'Cacher et passer au suivant') + '</button>'
          : '<p class="note note--center">Thème : ' + esc(themeById(g.themeId).name) + '</p>') +
      '</div>';
  };

  function remaining(g) {
    var c = G.countAlive(g.roles, g.alive);
    var parts = '<span class="tag">' + plural(g.alive.length, 'joueur', 'joueurs') + ' en jeu</span>';
    if (g.startCounts.under) parts += '<span class="tag tag--under">' + c.under + ' Undercover</span>';
    if (g.startCounts.blank) parts += '<span class="tag tag--blank">' + plural(c.blank, 'Page Blanche', 'Pages Blanches') + '</span>';
    return '<div class="tags">' + parts + '</div>';
  }

  SCREENS.round = function () {
    var g = state.game;
    var order = G.speakingOrder(g.order, g.alive, g.starter);
    var list = order.map(function (id, i) {
      return '<li class="speaker' + (i === 0 ? ' speaker--first' : '') + '"><span class="speaker__n">' + (i + 1) + '</span>' +
        '<span class="speaker__name">' + esc(g.names[id]) + '</span>' +
        (i === 0 ? '<span class="speaker__tag">commence</span>' : '') + '</li>';
    }).join('');
    return '' +
      '<header class="top"><span class="step-label">Tour ' + g.round + '</span>' +
        '<button class="link" data-act="quit" data-fkey="quit">Quitter</button></header>' +
      '<h1 class="title" tabindex="-1">Un mot chacun</h1>' +
      remaining(g) +
      '<p class="lead lead--small">Dans cet ordre, chacun donne un seul mot en rapport avec le sien. Ensuite, débattez.</p>' +
      '<ol class="speakers">' + list + '</ol>' +
      '<div class="bar">' +
        '<button class="btn btn--primary" data-act="go-vote" data-fkey="go-vote">Passer au vote</button>' +
        '<button class="btn" data-act="peek-open" data-fkey="peek">Revoir un mot</button>' +
      '</div>';
  };

  SCREENS.vote = function () {
    var g = state.game;
    var list = g.alive.map(function (id) {
      return '<button class="pick" data-act="vote-pick" data-arg="' + id + '" data-fkey="pick-' + id + '" aria-pressed="' + (g.pick === id) + '">' +
        esc(g.names[id]) + '</button>';
    }).join('');
    var picked = g.pick !== null && g.alive.indexOf(g.pick) !== -1;
    return '' +
      '<header class="top"><span class="step-label">Tour ' + g.round + ' · Vote</span>' +
        '<button class="link" data-act="back-round">Retour</button></header>' +
      '<h1 class="title" tabindex="-1">Qui est éliminé ?</h1>' +
      '<p class="lead lead--small">Votez à main levée, puis touchez le joueur le plus désigné. En cas d\'égalité, revotez entre les ex æquo.</p>' +
      '<div class="picks">' + list + '</div>' +
      '<div class="bar">' +
        '<button class="btn btn--danger" data-act="vote-confirm" data-fkey="vote-confirm"' + (picked ? '' : ' disabled') + '>' +
          (picked ? 'Éliminer ' + esc(g.names[g.pick]) : 'Choisissez un joueur') + '</button>' +
      '</div>';
  };

  SCREENS.reveal = function () {
    var g = state.game;
    var id = g.last;
    var role = g.roles[id];
    var body;
    var actions;

    if (g.pendingGuess) {
      body = '<p class="lead lead--small">Dernière chance : devine le mot des Civils et tu gagnes la partie.</p>' +
        '<form class="guess" data-form="guess" novalidate>' +
          '<label class="label" for="guess-input">Ta proposition</label>' +
          '<input class="input input--big" id="guess-input" name="guess" maxlength="40" autocomplete="off" autocapitalize="words" enterkeyhint="send" data-fkey="guess">' +
          '<button class="btn btn--primary" type="submit" data-fkey="guess-ok">Valider</button>' +
        '</form>';
      actions = '<button class="btn" data-act="guess-skip" data-fkey="guess-skip">Je passe</button>';
    } else {
      var note = '';
      if (g.guess && !g.guess.ok) {
        note = '<p class="verdict">' + (g.guess.text
          ? 'Proposition « ' + esc(g.guess.text) + ' » : ce n\'est pas le mot.'
          : 'Aucune proposition.') + '</p>';
      } else if (role === 'civil') {
        note = '<p class="verdict">Un innocent de moins. Les infiltrés se rapprochent.</p>';
      } else {
        note = '<p class="verdict">Bien vu.</p>';
      }
      body = note;
      actions = '<button class="btn btn--primary" data-act="continue" data-fkey="continue">' +
        (g.winner ? 'Voir le résultat' : 'Tour suivant') + '</button>';
    }

    return '' +
      '<header class="top"><span class="step-label">Tour ' + g.round + ' · Élimination</span></header>' +
      '<div class="reveal reveal--' + role + '">' +
        '<p class="reveal__label">Éliminé</p>' +
        '<h1 class="reveal__name" tabindex="-1">' + esc(g.names[id]) + '</h1>' +
        '<p class="reveal__role">était ' + badge(role) + '</p>' +
      '</div>' +
      body +
      '<div class="bar">' + actions + '</div>';
  };

  SCREENS.end = function () {
    var g = state.game;
    var headline;
    var sub;
    if (g.winner === 'civil') {
      headline = 'Les Civils gagnent';
      sub = 'Tous les infiltrés ont été démasqués.';
    } else if (g.winner === 'blank') {
      headline = esc(g.names[g.blankWinner]) + ' gagne';
      sub = 'La Page Blanche a deviné le mot des Civils.';
    } else {
      headline = g.startCounts.under ? (g.startCounts.blank ? 'Les infiltrés gagnent' : 'Les Undercover gagnent') : 'La Page Blanche gagne';
      sub = 'Il ne reste plus assez de Civils pour les arrêter.';
    }

    var rows = g.order.map(function (id) {
      var total = 0;
      state.players.forEach(function (p) { if (p.id === id) total = p.score; });
      var pts = g.points ? g.points[id] : 0;
      var out = g.alive.indexOf(id) === -1;
      return '<li class="result' + (pts ? ' result--win' : '') + '">' +
        '<span class="result__name' + (out ? ' result__name--out' : '') + '">' + esc(g.names[id]) + '</span>' +
        badge(g.roles[id]) +
        '<span class="result__pts">' + (pts ? '+' + pts : '–') + '</span>' +
        '<span class="result__total">' + total + ' pts</span></li>';
    }).join('');

    return '' +
      '<header class="top"><span class="step-label">Fin de partie · ' + plural(g.round, 'tour', 'tours') + '</span></header>' +
      '<div class="winner winner--' + g.winner + '">' +
        '<h1 class="winner__title" tabindex="-1">' + headline + '</h1>' +
        '<p class="winner__sub">' + sub + '</p>' +
      '</div>' +
      '<div class="words">' +
        '<div class="word word--civil"><span>Mot des Civils</span><strong>' + esc(g.civilWord) + '</strong></div>' +
        (g.startCounts.under ? '<div class="word word--under"><span>Mot des Undercover</span><strong>' + esc(g.underWord) + '</strong></div>' : '') +
      '</div>' +
      '<section class="panel"><div class="panel__head"><h2 class="panel__title">Joueurs</h2><span class="count">' + esc(themeById(g.themeId).name) + '</span></div>' +
        '<ul class="results">' + rows + '</ul></section>' +
      '<div class="bar">' +
        '<p class="error" role="alert"' + (ui.error ? '' : ' hidden') + '>' + esc(ui.error) + '</p>' +
        '<button class="btn btn--primary" data-act="replay" data-fkey="replay">Rejouer avec de nouveaux mots</button>' +
        '<button class="btn" data-act="go" data-arg="setup" data-fkey="edit">Modifier joueurs, rôles ou thèmes</button>' +
      '</div>';
  };

  /* ---------- feuille modale ---------- */

  function renderOverlay() {
    var s = ui.sheet;
    if (!s) {
      $overlay.hidden = true;
      $overlay.innerHTML = '';
      $app.inert = false;
      return;
    }
    var inner = '';
    if (s.type === 'confirm') {
      inner = '<h2 class="sheet__title" id="sheet-title">' + esc(s.title) + '</h2>' +
        '<p class="sheet__text">' + esc(s.text) + '</p>' +
        '<div class="sheet__actions">' +
          '<button class="btn btn--danger" data-act="confirm-ok">' + esc(s.ok) + '</button>' +
          '<button class="btn" data-act="sheet-close">Annuler</button>' +
        '</div>';
    } else if (s.type === 'peek') {
      var g = state.game;
      if (s.id === null) {
        inner = '<h2 class="sheet__title" id="sheet-title">Qui veut revoir son mot ?</h2>' +
          '<div class="picks">' + g.alive.map(function (id) {
            return '<button class="pick" data-act="peek-pick" data-arg="' + id + '">' + esc(g.names[id]) + '</button>';
          }).join('') + '</div>' +
          '<div class="sheet__actions"><button class="btn" data-act="sheet-close">Fermer</button></div>';
      } else {
        inner = '<h2 class="sheet__title" id="sheet-title">' + (s.shown ? 'Mémorise, puis cache' : 'Passe le téléphone à ' + esc(g.names[s.id])) + '</h2>' +
          '<div class="stage stage--sheet">' + secretCard(g, s.id, s.shown, 'peek-show') + '</div>' +
          '<div class="sheet__actions"><button class="btn btn--primary" data-act="sheet-close">' + (s.shown ? 'Cacher' : 'Annuler') + '</button></div>';
      }
    }
    $app.inert = true;
    $overlay.hidden = false;
    $overlay.innerHTML = '<div class="backdrop" data-act="sheet-close"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">' + inner + '</div>';
    var first = $overlay.querySelector('.sheet button');
    if (first) first.focus({ preventScroll: true });
  }

  function openSheet(sheet) {
    var active = document.activeElement;
    if (!ui.sheet) ui.returnKey = active && active.dataset ? active.dataset.fkey : null;
    ui.sheet = sheet;
    renderOverlay();
  }

  function openConfirm(title, text, ok, onOk) {
    openSheet({ type: 'confirm', title: title, text: text, ok: ok, onOk: onOk });
  }

  /* Referme la feuille et rend le focus au bouton qui l'avait ouverte. */
  function closeSheet(onClose) {
    ui.sheet = null;
    if (onClose) onClose();
    render();
    var back = ui.returnKey ? $app.querySelector('[data-fkey="' + ui.returnKey + '"]') : null;
    if (back) back.focus({ preventScroll: true });
  }

  /* ---------- logique de partie ---------- */

  function setCounts(under, blank) {
    var c = G.clampCounts(state.players.length, under, blank);
    state.under = c.under;
    state.blank = c.blank;
  }

  function validateSetup() {
    var seen = {};
    for (var i = 0; i < state.players.length; i++) {
      var key = G.normalize(displayName(state.players[i], i));
      if (seen[key]) return 'Deux joueurs portent le même nom : « ' + displayName(state.players[i], i) + ' ». Changez-en un.';
      seen[key] = true;
    }
    if (!state.themes.length) return 'Cochez au moins un thème pour tirer des mots.';
    return '';
  }

  function startGame() {
    var err = validateSetup();
    if (err) return err;
    setCounts(state.under, state.blank);

    var pair = G.pickPair(THEMES, state.themes, state.used);
    if (!pair) return 'Cochez au moins un thème pour tirer des mots.';
    if (pair.exhausted) {
      /* toutes les paires de ces thèmes ont été jouées : on oublie celles-ci et on recommence */
      state.used = state.used.filter(function (k) { return state.themes.indexOf(k.split('::')[0]) === -1; });
    }
    state.used.push(pair.key);

    var order = state.players.map(function (p) { return p.id; });
    var names = {};
    state.players.forEach(function (p, i) { names[p.id] = displayName(p, i); });
    var roles = G.assignRoles(order, state.under, state.blank);

    state.game = {
      civilWord: pair.civil, underWord: pair.under, themeId: pair.themeId,
      roles: roles, names: names, order: order, alive: order.slice(),
      startCounts: { under: state.under, blank: state.blank },
      starter: G.pickStarter(order, roles), round: 1,
      dealIdx: 0, shown: false, pick: null,
      last: null, pendingGuess: false, guess: null,
      winner: null, blankWinner: null, points: null, finished: false
    };
    state.screen = 'deal';
    return '';
  }

  function finishGame() {
    var g = state.game;
    if (!g.finished) {
      g.points = G.scoreGame(g.roles, g.winner, g.blankWinner);
      state.players.forEach(function (p) { p.score += g.points[p.id] || 0; });
      g.finished = true;
    }
    state.screen = 'end';
  }

  /* ---------- actions ---------- */

  var ACTIONS = {
    go: function (screen) {
      ui.error = '';
      if (screen === 'setup' || screen === 'home') state.game = null;
      state.screen = screen;
      render();
    },

    'player-add': function () {
      if (state.players.length >= G.MAX_PLAYERS) return;
      var id = state.nextId++;
      state.players.push({ id: id, name: '', score: 0 });
      setCounts(state.under, state.blank);
      ui.error = '';
      render();
      var input = document.getElementById('name-' + id);
      if (input) input.focus();
    },

    'player-remove': function (arg) {
      if (state.players.length <= G.MIN_PLAYERS) return;
      var id = Number(arg);
      state.players = state.players.filter(function (p) { return p.id !== id; });
      setCounts(state.under, state.blank);
      ui.error = '';
      render();
    },

    count: function (arg) {
      var parts = arg.split(':');
      var delta = Number(parts[1]);
      var under = state.under + (parts[0] === 'under' ? delta : 0);
      var blank = state.blank + (parts[0] === 'blank' ? delta : 0);
      if (under < 0 || blank < 0 || under + blank < 1) return;
      if (under + blank > state.players.length - G.MIN_CIVILS) return;
      state.under = under;
      state.blank = blank;
      render();
    },

    preset: function (kind) {
      var c = kind === 'half' ? G.half(state.players.length) : G.recommend(state.players.length);
      state.under = c.under;
      state.blank = c.blank;
      render();
    },

    theme: function (id) {
      var i = state.themes.indexOf(id);
      if (i === -1) state.themes.push(id); else state.themes.splice(i, 1);
      ui.error = '';
      render();
    },

    'themes-all': function () {
      state.themes = THEMES.map(function (t) { return t.id; });
      ui.error = '';
      render();
    },

    'themes-none': function () { state.themes = []; render(); },

    'scores-reset': function () {
      openConfirm('Remettre les scores à zéro ?', 'Les points de tous les joueurs seront effacés.', 'Effacer les scores', function () {
        state.players.forEach(function (p) { p.score = 0; });
      });
    },

    start: function () {
      ui.error = startGame();
      render();
      if (ui.error) {
        var e = document.getElementById('setup-error');
        if (e) e.scrollIntoView({ block: 'nearest' });
      }
    },

    replay: function () {
      ui.error = startGame();
      render();
    },

    'deal-show': function () {
      state.game.shown = true;
      render();
      var next = $app.querySelector('[data-fkey="deal-next"]');
      if (next) next.focus({ preventScroll: true });
    },

    'deal-next': function () {
      var g = state.game;
      g.shown = false;
      if (g.dealIdx < g.order.length - 1) g.dealIdx++;
      else state.screen = 'round';
      render();
      var card = $app.querySelector('[data-fkey="secret"]');
      if (card) card.focus({ preventScroll: true });
    },

    'go-vote': function () { state.game.pick = null; state.screen = 'vote'; render(); },
    'back-round': function () { state.screen = 'round'; render(); },

    'vote-pick': function (arg) {
      var id = Number(arg);
      state.game.pick = state.game.pick === id ? null : id;
      render();
    },

    'vote-confirm': function () {
      var g = state.game;
      if (g.pick === null || g.alive.indexOf(g.pick) === -1) return;
      var id = g.pick;
      g.alive = g.alive.filter(function (x) { return x !== id; });
      g.last = id;
      g.pick = null;
      g.guess = null;
      g.pendingGuess = g.roles[id] === 'blank';
      g.winner = g.pendingGuess ? null : G.checkWinner(g.roles, g.alive);
      state.screen = 'reveal';
      render();
      var input = document.getElementById('guess-input');
      if (input) input.focus();
    },

    'guess-skip': function () { resolveGuess(''); },

    'continue': function () {
      var g = state.game;
      if (g.pendingGuess) return;
      if (g.winner) {
        finishGame();
      } else {
        g.round++;
        g.starter = G.nextStarter(g.order, g.alive, g.starter);
        state.screen = 'round';
      }
      render();
    },

    quit: function () {
      openConfirm('Quitter la partie ?', 'La partie en cours sera perdue. Les scores déjà gagnés sont conservés.', 'Quitter', function () {
        state.game = null;
        state.screen = 'setup';
      });
    },

    'peek-open': function () { openSheet({ type: 'peek', id: null, shown: false }); },
    'peek-pick': function (arg) { openSheet({ type: 'peek', id: Number(arg), shown: false }); },
    'peek-show': function () { if (ui.sheet) { ui.sheet.shown = true; renderOverlay(); } },
    'sheet-close': function () { closeSheet(); },
    'confirm-ok': function () { closeSheet(ui.sheet && ui.sheet.onOk); }
  };

  function resolveGuess(text) {
    var g = state.game;
    if (!g || !g.pendingGuess) return;
    text = String(text || '').trim().slice(0, 40);
    var ok = G.matchGuess(text, g.civilWord, g.underWord);
    g.pendingGuess = false;
    g.guess = { text: text, ok: ok };
    if (ok) {
      g.winner = 'blank';
      g.blankWinner = g.last;
      finishGame();
    } else {
      g.winner = G.checkWinner(g.roles, g.alive);
    }
    render();
  }

  /* ---------- événements ---------- */

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el || el.disabled) return;
    var fn = ACTIONS[el.dataset.act];
    if (fn) fn(el.dataset.arg, el);
  });

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.dataset || el.dataset.input !== 'name') return;
    var id = Number(el.dataset.id);
    state.players.forEach(function (p) { if (p.id === id) p.name = el.value.slice(0, NAME_MAX); });
    if (ui.error) {
      ui.error = '';
      var err = document.getElementById('setup-error');
      if (err) err.hidden = true;
    }
    save();
  });

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.dataset || form.dataset.form !== 'guess') return;
    e.preventDefault();
    var input = form.querySelector('input');
    if (!input.value.trim()) { input.focus(); return; }
    resolveGuess(input.value);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && ui.sheet) closeSheet();
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.input === 'name') e.target.blur();
  });

  /* ---------- démarrage ---------- */

  function boot(data) {
    state = data && data.state ? sanitize(data.state) : load();
    document.documentElement.lang = 'fr';
    render();
  }

  var hot = window.claude && window.claude.hot;
  try {
    if (hot && hot.snapshot) hot.snapshot(function () { return { state: state }; });
  } catch (e) { /* hors visionneuse */ }
  if (hot && hot.ready) hot.ready(boot); else boot(hot && hot.data);

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && document.querySelector('link[rel="manifest"]')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* hors ligne indisponible ici */ });
    });
  }
})();
