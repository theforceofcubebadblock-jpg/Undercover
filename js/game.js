/* Règles du jeu, sans aucun accès au DOM : testable avec Node. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Game = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MIN_PLAYERS = 3;
  var MAX_PLAYERS = 20;
  /* Avec un seul Civil au départ, les infiltrés auraient gagné avant le premier vote. */
  var MIN_CIVILS = 2;

  var POINTS = { civil: 2, under: 5, blank: 5, blankGuess: 8 };

  function toCount(v) {
    v = Math.floor(Number(v));
    return v > 0 && isFinite(v) ? v : 0;
  }

  /* Ramène une répartition demandée à une répartition jouable pour n joueurs. */
  function clampCounts(n, under, blank) {
    under = toCount(under);
    blank = toCount(blank);
    var max = Math.max(1, n - MIN_CIVILS);
    if (under + blank > max) {
      blank = Math.max(0, Math.min(blank, max - Math.min(under, max)));
      under = Math.min(under, max - blank);
    }
    if (under + blank === 0) under = 1;
    return { under: under, blank: blank, civil: n - under - blank };
  }

  function recommend(n) {
    var total = Math.max(1, Math.floor(n / 3));
    var blank = n >= 5 ? 1 : 0;
    var under = Math.max(1, total - blank);
    return clampCounts(n, under, blank);
  }

  /* Autant d'Undercover que de Civils (un Civil de plus si le nombre est impair). */
  function half(n) {
    return clampCounts(n, Math.floor(n / 2), 0);
  }

  function shuffle(list, rng) {
    rng = rng || Math.random;
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function assignRoles(ids, under, blank, rng) {
    var mixed = shuffle(ids, rng);
    var roles = {};
    mixed.forEach(function (id, i) {
      roles[id] = i < under ? 'under' : i < under + blank ? 'blank' : 'civil';
    });
    return roles;
  }

  /* La Page Blanche ne parle jamais en premier : elle n'aurait aucun indice sur lequel s'appuyer. */
  function pickStarter(order, roles, rng) {
    rng = rng || Math.random;
    var eligible = order.filter(function (id) { return roles[id] !== 'blank'; });
    var pool = eligible.length ? eligible : order;
    return pool[Math.floor(rng() * pool.length)];
  }

  function speakingOrder(order, alive, starter) {
    var start = Math.max(0, order.indexOf(starter));
    var out = [];
    for (var i = 0; i < order.length; i++) {
      var id = order[(start + i) % order.length];
      if (alive.indexOf(id) !== -1) out.push(id);
    }
    return out;
  }

  function nextStarter(order, alive, prev) {
    var start = order.indexOf(prev);
    for (var i = 1; i <= order.length; i++) {
      var id = order[(start + i) % order.length];
      if (alive.indexOf(id) !== -1) return id;
    }
    return alive[0];
  }

  function countAlive(roles, alive) {
    var c = { civil: 0, under: 0, blank: 0 };
    alive.forEach(function (id) { c[roles[id]]++; });
    return c;
  }

  /* null tant que la partie continue. Un Civil seul ne peut plus gagner :
     chaque vote suivant mène à un duel perdu, donc on arrête là. */
  function checkWinner(roles, alive) {
    var c = countAlive(roles, alive);
    if (c.under + c.blank === 0) return 'civil';
    if (c.civil <= 1) return 'infiltres';
    return null;
  }

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/^\s*(les|le|la|l|un|une|des|du)(?=[\s'’])[\s'’]*/, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    var prev = [];
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      var cur = [i];
      for (var k = 1; k <= b.length; k++) {
        cur[k] = Math.min(
          prev[k] + 1,
          cur[k - 1] + 1,
          prev[k - 1] + (a.charCodeAt(i - 1) === b.charCodeAt(k - 1) ? 0 : 1)
        );
      }
      prev = cur;
    }
    return prev[b.length];
  }

  /* Tolère accents, articles et petites fautes de frappe, mais jamais le mot des Undercover. */
  function matchGuess(guess, word, otherWord) {
    var g = normalize(guess);
    var w = normalize(word);
    if (!g || !w) return false;
    if (g === w) return true;
    if (otherWord && g === normalize(otherWord)) return false;
    var tolerance = w.length >= 9 ? 2 : w.length >= 5 ? 1 : 0;
    return levenshtein(g, w) <= tolerance;
  }

  function pairKey(themeId, pair) { return themeId + '::' + pair; }

  /* Tire une paire jamais jouée dans les thèmes choisis ; quand tout a été joué, on repart de zéro. */
  function pickPair(themes, selectedIds, usedKeys, rng) {
    rng = rng || Math.random;
    var all = [];
    themes.forEach(function (t) {
      if (selectedIds.indexOf(t.id) === -1) return;
      t.pairs.forEach(function (p) { all.push({ themeId: t.id, raw: p, key: pairKey(t.id, p) }); });
    });
    if (!all.length) return null;
    var fresh = all.filter(function (p) { return usedKeys.indexOf(p.key) === -1; });
    var exhausted = fresh.length === 0;
    var pool = exhausted ? all : fresh;
    var chosen = pool[Math.floor(rng() * pool.length)];
    var words = chosen.raw.split('|');
    var flip = rng() < 0.5;
    return {
      themeId: chosen.themeId,
      key: chosen.key,
      civil: flip ? words[1] : words[0],
      under: flip ? words[0] : words[1],
      exhausted: exhausted
    };
  }

  function scoreGame(roles, winner, blankWinnerId) {
    var pts = {};
    Object.keys(roles).forEach(function (id) {
      var role = roles[id];
      var p = 0;
      if (winner === 'civil' && role === 'civil') p = POINTS.civil;
      else if (winner === 'infiltres' && role === 'under') p = POINTS.under;
      else if (winner === 'infiltres' && role === 'blank') p = POINTS.blank;
      else if (winner === 'blank' && String(id) === String(blankWinnerId)) p = POINTS.blankGuess;
      pts[id] = p;
    });
    return pts;
  }

  return {
    MIN_PLAYERS: MIN_PLAYERS,
    MAX_PLAYERS: MAX_PLAYERS,
    MIN_CIVILS: MIN_CIVILS,
    POINTS: POINTS,
    clampCounts: clampCounts,
    recommend: recommend,
    half: half,
    shuffle: shuffle,
    assignRoles: assignRoles,
    pickStarter: pickStarter,
    speakingOrder: speakingOrder,
    nextStarter: nextStarter,
    countAlive: countAlive,
    checkWinner: checkWinner,
    normalize: normalize,
    levenshtein: levenshtein,
    matchGuess: matchGuess,
    pickPair: pickPair,
    scoreGame: scoreGame
  };
});
