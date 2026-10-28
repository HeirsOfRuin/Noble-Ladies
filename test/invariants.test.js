// What can never be true. Impossibility assertions, not magnitudes: magnitude
// asserts get deleted on the first rebalance, impossibility asserts survive it.
// Each test plays real games through the bot, so "it held" means it held over
// games that actually happened.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, advance, view, planProblem } from '../src/engine/turn.js';
import { decide, POLICIES } from '../sim/bot.js';
import { ladyAge, FIRST_TURN, LAST_TURN, keyOf, turnOfKey } from '../src/engine/clock.js';
import { CAST } from '../src/data/cast.data.js';
import { ACT1 } from '../src/data/act1.data.js';
import { HISTORY, SWINGS } from '../src/data/history.data.js';

function playThrough(seed, policy = 'christine', difficulty = 'normal', each = () => {}) {
  let s = newGame({ seed, difficulty });
  for (let i = 0; !s.over && i < 3000; i++) {
    const prev = s;
    s = advance(s, decide(s, policy)).state;
    each(s, prev);
  }
  return s;
}

test('she is seventeen through Act 1 and eighteen at the wedding', () => {
  for (let t = 1; t < FIRST_TURN; t++) assert.equal(ladyAge(t), 17, `scene ${t}`);
  assert.equal(ladyAge(FIRST_TURN), 18, 'spring 1401');
  assert.equal(ACT1.length, FIRST_TURN - 1, 'one turn per Act 1 scene');
  for (let seed = 1; seed <= 10; seed++) {
    let s = newGame({ seed });
    while (s.phase === 'scene') {
      assert.equal(view(s).scene.age, 17);
      s = advance(s, decide(s, 'christine')).state;
    }
    const wedding = s.cards.find((c) => c.id === 'wedding');
    assert.ok(wedding, 'the wedding card follows Act 1');
    assert.match(wedding.text, /at eighteen/);
    assert.equal(ladyAge(s.turn), 18);
  }
});

test('no Act 1 text says she is younger than seventeen', () => {
  const words = JSON.stringify(ACT1);
  assert.doesNotMatch(words, /\b(fourteen|fifteen|sixteen|1[0-6] years)\b/i);
});

test('purse equals the ledger, every step', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const policy = POLICIES[seed % POLICIES.length];
    playThrough(seed, policy, 'normal', (s) => {
      const sum = s.ledger.reduce((a, r) => a + r.amount, 0);
      assert.equal(s.money, sum, `seed ${seed} (${policy}) turn ${s.turn}`);
    });
  }
});

test('no number is ever NaN, and the bounded ones stay in bounds', () => {
  for (let seed = 1; seed <= 20; seed++) {
    playThrough(seed, 'random', 'hard', (s) => {
      for (const k of ['money', 'turn', 'lands']) assert.ok(Number.isFinite(s[k]), `${k} at seed ${seed}`);
      for (const k of ['rep', 'info', 'hh', 'health']) assert.ok(s[k] >= 0 && s[k] <= 100, `${k}=${s[k]} at seed ${seed}`);
      for (const f of ['queen', 'arm', 'bur']) assert.ok(s.fav[f] >= 0 && s.fav[f] <= 100);
      for (const n of Object.values(s.npcs)) assert.ok(n.trust >= 0 && n.trust <= 100 && n.use >= 0 && n.use <= 100);
      assert.ok(s.lands >= 0);
    });
  }
});

test('every game ends, with an ending, and the clock never stalls', () => {
  for (const policy of POLICIES) {
    for (let seed = 1; seed <= 6; seed++) {
      let idle = 0;
      const s = playThrough(seed, policy, 'normal', (st, prev) => {
        idle = st.turn > prev.turn ? 0 : idle + 1;
        assert.ok(idle < 12, `${policy} seed ${seed}: twelve inputs without the clock moving`);
      });
      assert.ok(s.over, `${policy} seed ${seed} never ended`);
      assert.ok(['survived', 'dead', 'ruined'].includes(s.outcome));
      assert.ok(s.ending && s.ending.epitaph.length > 80 && Number.isFinite(s.ending.total));
      if (s.outcome === 'survived') assert.equal(s.turn, LAST_TURN + 1);
    }
  }
});

test('same seed and same choices give the same game', () => {
  assert.deepEqual(playThrough(7, 'random'), playThrough(7, 'random'));
  assert.deepEqual(playThrough(8, 'christine'), playThrough(8, 'christine'));
});

test('the dead stay dead: no real figure acts after the date history removes them', () => {
  for (let seed = 1; seed <= 15; seed++) {
    playThrough(seed, seed % 2 ? 'orleans' : 'courtier', 'normal', (s) => {
      for (const p of s.pensions) {
        const gone = CAST[p.from].gone;
        if (gone && s.turn > turnOfKey(gone) && p.faction === 'none') assert.fail(`${p.from} pays after ${gone}`);
      }
      if (s.phase === 'plan') {
        const v = view(s).plan.places[0].actions.find((a) => a.id === 'petition');
        for (const t of v.targets || []) {
          const c = CAST[t.id];
          if (c.gone) assert.ok(s.turn <= turnOfKey(c.gone), `${t.id} offered as patron after ${c.gone}`);
          if (c.from) assert.ok(s.turn >= turnOfKey(c.from), `${t.id} offered as patron before ${c.from}`);
        }
      }
    });
  }
});

test('every turning point and swing is on the calendar', () => {
  for (const k of [...Object.keys(HISTORY), ...Object.keys(SWINGS)]) {
    const t = turnOfKey(k);
    assert.ok(t >= FIRST_TURN && t <= LAST_TURN, k);
    assert.equal(keyOf(t), k);
  }
});

test('a plan the view marks as not allowed is refused by the engine', () => {
  let s = newGame({ seed: 3 });
  while (s.phase !== 'plan') s = advance(s, decide(s, 'christine')).state;
  assert.throws(() => advance(s, { type: 'plan', place: 'estates', actions: [{ id: 'attend' }] }), /not allowed/);
  assert.throws(() => advance(s, { type: 'plan', place: 'court', actions: [{ id: 'attend' }, { id: 'attend' }] }), /not allowed/);
  assert.throws(() => advance(s, { type: 'plan', place: 'court', actions: [{ id: 'lawsuit' }] }), /not allowed/);
  assert.equal(planProblem(s, { place: 'court', actions: [] }), null);
});

test('every action the plan screen enables, the engine accepts', () => {
  for (let seed = 1; seed <= 8; seed++) {
    let s = newGame({ seed });
    while (!s.over) {
      if (s.phase === 'plan') {
        for (const pl of view(s).plan.places) {
          for (const a of pl.actions.filter((x) => x.ok)) {
            const target = a.targets ? a.targets.find((t) => t.ok)?.id : undefined;
            assert.equal(planProblem(s, { place: pl.place, actions: [{ id: a.id, target }] }), null, `${a.id} at ${pl.place}, seed ${seed} turn ${s.turn}`);
          }
        }
      }
      s = advance(s, decide(s, 'seasonal')).state;
    }
  }
});
