'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../js/game.js');
const THEMES = require('../js/words.js');

/* Générateur déterministe pour des tirages reproductibles. */
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

test('toute répartition est ramenée à au moins 2 Civils et 1 infiltré', () => {
  for (let n = G.MIN_PLAYERS; n <= G.MAX_PLAYERS; n++) {
    for (let u = -1; u <= n + 2; u++) {
      for (let b = -1; b <= n + 2; b++) {
        const c = G.clampCounts(n, u, b);
        assert.equal(c.civil + c.under + c.blank, n);
        assert.ok(c.civil >= G.MIN_CIVILS, `n=${n} u=${u} b=${b}`);
        assert.ok(c.under + c.blank >= 1, `n=${n} u=${u} b=${b}`);
        assert.ok(c.under >= 0 && c.blank >= 0);
      }
    }
  }
});

test('une répartition déjà valide est conservée telle quelle', () => {
  assert.deepEqual(G.clampCounts(8, 4, 0), { under: 4, blank: 0, civil: 4 });
  assert.deepEqual(G.clampCounts(8, 5, 1), { under: 5, blank: 1, civil: 2 });
  assert.deepEqual(G.clampCounts(6, 0, 3), { under: 0, blank: 3, civil: 3 });
});

test('« moitié Undercover » donne autant d\'Undercover que de Civils', () => {
  assert.deepEqual(G.half(6), { under: 3, blank: 0, civil: 3 });
  assert.deepEqual(G.half(10), { under: 5, blank: 0, civil: 5 });
  assert.deepEqual(G.half(7), { under: 3, blank: 0, civil: 4 });
  assert.deepEqual(G.half(3), { under: 1, blank: 0, civil: 2 });
});

test('la répartition conseillée laisse toujours les Civils majoritaires', () => {
  for (let n = G.MIN_PLAYERS; n <= G.MAX_PLAYERS; n++) {
    const c = G.recommend(n);
    assert.ok(c.civil > c.under + c.blank, `n=${n}`);
    assert.ok(c.under >= 1);
  }
});

test('les rôles distribués respectent exactement les nombres demandés', () => {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8];
  for (let seed = 1; seed <= 50; seed++) {
    const roles = G.assignRoles(ids, 4, 1, seeded(seed));
    const c = G.countAlive(roles, ids);
    assert.deepEqual(c, { civil: 3, under: 4, blank: 1 });
  }
});

test('la distribution n\'avantage aucune place à table', () => {
  const ids = [1, 2, 3, 4, 5];
  const hits = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const rng = seeded(42);
  for (let i = 0; i < 5000; i++) {
    const roles = G.assignRoles(ids, 1, 0, rng);
    ids.forEach((id) => { if (roles[id] === 'under') hits[id]++; });
  }
  ids.forEach((id) => assert.ok(hits[id] > 850 && hits[id] < 1150, `joueur ${id}: ${hits[id]}`));
});

test('la Page Blanche ne commence jamais', () => {
  const order = [1, 2, 3, 4];
  const roles = { 1: 'blank', 2: 'civil', 3: 'blank', 4: 'civil' };
  for (let seed = 1; seed <= 100; seed++) {
    assert.notEqual(roles[G.pickStarter(order, roles, seeded(seed))], 'blank');
  }
});

test('l\'ordre de parole tourne autour de la table en sautant les éliminés', () => {
  assert.deepEqual(G.speakingOrder([1, 2, 3, 4, 5], [1, 2, 4, 5], 4), [4, 5, 1, 2]);
  assert.equal(G.nextStarter([1, 2, 3, 4, 5], [1, 2, 4], 4), 1);
  assert.equal(G.nextStarter([1, 2, 3, 4, 5], [1, 2, 5], 2), 5);
  /* le joueur qui avait commencé vient d'être éliminé */
  assert.equal(G.nextStarter([1, 2, 3, 4, 5], [1, 2, 4, 5], 3), 4);
});

test('conditions de victoire', () => {
  const roles = { 1: 'civil', 2: 'civil', 3: 'civil', 4: 'under', 5: 'blank' };
  assert.equal(G.checkWinner(roles, [1, 2, 3, 4, 5]), null);
  assert.equal(G.checkWinner(roles, [1, 2, 3]), 'civil');
  assert.equal(G.checkWinner(roles, [1, 2, 5]), null);
  assert.equal(G.checkWinner(roles, [1, 4]), 'infiltres');
  assert.equal(G.checkWinner(roles, [1, 4, 5]), 'infiltres');
  assert.equal(G.checkWinner(roles, [4, 5]), 'infiltres');
});

test('une partie à égalité Civils / Undercover ne se termine pas avant le premier vote', () => {
  const roles = { 1: 'civil', 2: 'civil', 3: 'civil', 4: 'under', 5: 'under', 6: 'under' };
  assert.equal(G.checkWinner(roles, [1, 2, 3, 4, 5, 6]), null);
  assert.equal(G.checkWinner(roles, [1, 2, 3, 4]), null);
  assert.equal(G.checkWinner(roles, [1, 2, 3]), 'civil');
  assert.equal(G.checkWinner(roles, [1, 4, 5, 6]), 'infiltres');
});

test('toute partie jouable se termine, quelle que soit la suite de votes', () => {
  for (let n = G.MIN_PLAYERS; n <= 12; n++) {
    const ids = Array.from({ length: n }, (_, i) => i + 1);
    for (let u = 0; u <= n; u++) {
      for (let b = 0; b <= n; b++) {
        const c = G.clampCounts(n, u, b);
        if (c.under !== u || c.blank !== b) continue;
        const rng = seeded(n * 1000 + u * 31 + b);
        const roles = G.assignRoles(ids, u, b, rng);
        let alive = ids.slice();
        assert.equal(G.checkWinner(roles, alive), null, `fin immédiate n=${n} u=${u} b=${b}`);
        let winner = null;
        while (!winner) {
          const out = alive[Math.floor(rng() * alive.length)];
          alive = alive.filter((id) => id !== out);
          winner = G.checkWinner(roles, alive);
          assert.ok(alive.length >= 1);
        }
        assert.ok(winner === 'civil' || winner === 'infiltres');
      }
    }
  }
});

test('la proposition de la Page Blanche tolère accents, articles et petites fautes', () => {
  assert.ok(G.matchGuess('tour eiffel', 'Tour Eiffel'));
  assert.ok(G.matchGuess('la tour eifel', 'Tour Eiffel'));
  assert.ok(G.matchGuess('Elephant', 'Éléphant'));
  assert.ok(G.matchGuess('oeufs brouilles', 'Œufs brouillés'));
  assert.ok(G.matchGuess('attaque des titans', 'L\'Attaque des Titans'));
  assert.ok(G.matchGuess('l', 'L'));
  assert.ok(G.matchGuess('Sims', 'Les Sims'));
});

test('la proposition de la Page Blanche refuse un autre mot', () => {
  assert.equal(G.matchGuess('', 'Chat'), false);
  assert.equal(G.matchGuess('   ', 'Chat'), false);
  assert.equal(G.matchGuess('Chien', 'Chat'), false);
  assert.equal(G.matchGuess('Chot', 'Chat'), false, 'mot court : aucune tolérance');
  assert.equal(G.matchGuess('5G', '4G'), false);
  assert.equal(G.matchGuess('Zelda', 'Link'), false);
});

test('aucune paire de la bibliothèque ne confond ses deux mots', () => {
  THEMES.forEach((t) => t.pairs.forEach((p) => {
    const [a, b] = p.split('|');
    assert.equal(G.matchGuess(b, a, b), false, `${t.id}: ${p}`);
    assert.equal(G.matchGuess(a, b, a), false, `${t.id}: ${p}`);
  }));
});

test('la bibliothèque est bien formée', () => {
  const ids = new Set();
  let total = 0;
  THEMES.forEach((t) => {
    assert.ok(t.id && t.name && t.desc, `thème incomplet: ${t.id}`);
    assert.ok(!ids.has(t.id), `id en double: ${t.id}`);
    ids.add(t.id);
    assert.ok(t.pairs.length >= 40, `${t.id}: seulement ${t.pairs.length} paires`);
    const seen = new Set();
    t.pairs.forEach((p) => {
      const words = p.split('|');
      assert.equal(words.length, 2, `${t.id}: « ${p} »`);
      words.forEach((w) => {
        assert.ok(w.trim() === w && w.length > 0, `${t.id}: « ${p} »`);
        assert.ok(w.length <= 28, `${t.id}: « ${w} » est trop long pour la carte`);
      });
      const key = words.map(G.normalize).sort().join('|');
      assert.ok(!seen.has(key), `${t.id}: paire en double « ${p} »`);
      seen.add(key);
      total++;
    });
  });
  assert.ok(total >= 700, `bibliothèque trop petite: ${total}`);
});

test('le tirage évite les paires déjà jouées puis repart de zéro', () => {
  const themes = [{ id: 't', pairs: ['A|B', 'C|D', 'E|F'] }];
  const used = [];
  const rng = seeded(7);
  for (let i = 0; i < 3; i++) {
    const p = G.pickPair(themes, ['t'], used, rng);
    assert.equal(p.exhausted, false);
    assert.ok(!used.includes(p.key));
    assert.notEqual(p.civil, p.under);
    used.push(p.key);
  }
  assert.equal(G.pickPair(themes, ['t'], used, rng).exhausted, true);
  assert.equal(G.pickPair(themes, [], used, rng), null);
  assert.equal(G.pickPair(themes, ['inconnu'], used, rng), null);
});

test('le mot des Civils est tantôt l\'un, tantôt l\'autre', () => {
  const themes = [{ id: 't', pairs: ['A|B'] }];
  const rng = seeded(3);
  const seen = new Set();
  for (let i = 0; i < 40; i++) seen.add(G.pickPair(themes, ['t'], [], rng).civil);
  assert.deepEqual([...seen].sort(), ['A', 'B']);
});

test('points de fin de partie', () => {
  const roles = { 1: 'civil', 2: 'civil', 3: 'under', 4: 'blank' };
  assert.deepEqual(G.scoreGame(roles, 'civil', null), { 1: 2, 2: 2, 3: 0, 4: 0 });
  assert.deepEqual(G.scoreGame(roles, 'infiltres', null), { 1: 0, 2: 0, 3: 5, 4: 5 });
  assert.deepEqual(G.scoreGame(roles, 'blank', 4), { 1: 0, 2: 0, 3: 0, 4: 8 });
});
