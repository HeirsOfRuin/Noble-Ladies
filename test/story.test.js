// The story beats (docs/FRAME-DEPTH.md). Two kinds of check:
//  - the data is sound: every condition is known, every flag a beat reads is set
//    somewhere, every flag a beat sets is read somewhere (nothing is decoration,
//    hub rule 2), every beat leaves a way through;
//  - the beats happen: across real bot games every beat fires at least once,
//    no card shows a raw token, and the dead never speak.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { BEATS as STORY_BEATS, TOUCHES, ARCS, WANTS, MEMOS } from '../src/data/arcs.data.js';
const BEATS = [...STORY_BEATS, ...TOUCHES];
import { ACT1, ACT1_LATE } from '../src/data/act1.data.js';
import { KNOWN, flagsRead } from '../src/engine/cond.js';
import { flagsSet } from '../src/engine/effects.js';
import { turnOfKey, FIRST_TURN, LAST_TURN } from '../src/engine/clock.js';
import { newGame, advance, view } from '../src/engine/turn.js';
import { decide, POLICIES } from '../sim/bot.js';
import { CAST } from '../src/data/cast.data.js';

const conds = (b) => [...(b.if || []), ...(Array.isArray(b.text) ? b.text.map((p) => p.if) : []), ...b.choices.flatMap((c) => [c.show, c.need])].filter(Boolean);
const opsOf = (b) => [...(b.onSkip || []), ...b.choices.flatMap((c) => [...(c.ops || []), ...(c.win || []), ...(c.lose || [])])];

function walk(c, f) { if (!c) return; f(c); if (c[0] === 'not') walk(c[1], f); if (c[0] === 'any' || c[0] === 'all') c[1].forEach((x) => walk(x, f)); }

test('every beat is well formed and on the calendar', () => {
  const ids = new Set();
  for (const b of BEATS) {
    assert.ok(!ids.has(b.id), `duplicate beat ${b.id}`); ids.add(b.id);
    assert.ok(ARCS[b.arc], `${b.id}: unknown arc ${b.arc}`);
    const f = turnOfKey(b.from), u = turnOfKey(b.until);
    assert.ok(f >= FIRST_TURN && u <= LAST_TURN && f <= u, `${b.id}: window ${b.from}-${b.until}`);
    assert.ok(b.choices.length >= 1, `${b.id}: no choices`);
    for (const c of conds(b)) walk(c, (x) => assert.ok(KNOWN.has(x[0]), `${b.id}: unknown condition ${x[0]}`));
    for (const c of conds(b)) walk(c, (x) => { if (x[0] === 'beat') assert.ok(BEATS.some((y) => y.id === x[1]), `${b.id}: reads unknown beat ${x[1]}`); });
    for (const c of conds(b)) walk(c, (x) => { if (['trust', 'use', 'alive'].includes(x[0])) assert.ok(CAST[x[1]], `${b.id}: unknown person ${x[1]}`); });
    for (const c of conds(b)) walk(c, (x) => { if (x[0] === 'want') assert.ok(WANTS[x[1]], `${b.id}: unknown want ${x[1]}`); });
  }
});

test('every story choice has a memo for when the storyline returns', () => {
  for (const b of BEATS) b.choices.forEach((c, i) => assert.ok(c.memo || MEMOS[`${b.id}:${i}`], `${b.id}:${i} has no memo`));
  for (const k of Object.keys(MEMOS)) { const [id, i] = k.split(':'); assert.ok(STORY_BEATS.find((b) => b.id === id)?.choices[Number(i)], `memo ${k} names no choice`); }
});

test('every flag a beat reads is set somewhere, and every flag a beat sets is read somewhere', () => {
  const set = new Set(['quarrel', 'dowerAssigned', 'renounced', 'agincourt', 'remarried']); // set by Act 1 data and by the engine
  for (const b of BEATS) flagsSet(opsOf(b), set);
  for (const sc of [...ACT1, ...Object.values(ACT1_LATE)]) for (const c of sc.choices) flagsSet([...(c.ops || []), ...(c.win || []), ...(c.lose || [])], set);
  const read = new Set();
  for (const b of BEATS) for (const c of conds(b)) flagsRead(c, read);
  for (const f of read) assert.ok(set.has(f), `beats read flag "${f}" that nothing sets`);
  // Flags beats set must be read by a beat or by engine code (reflections, the epitaph, derive).
  const engine = readdirSync('src/engine').map((f) => readFileSync(`src/engine/${f}`, 'utf8')).join('\n');
  const beatSet = new Set();
  for (const b of BEATS) flagsSet(opsOf(b), beatSet);
  for (const f of beatSet) assert.ok(read.has(f) || engine.includes(`flags.${f}`) || engine.includes(`'${f}'`), `flag "${f}" is set by a beat and never read: decoration`);
});

// One soak shared by the remaining tests: every policy, 30 seeds.
const fired = new Map(), problems = [];
for (const policy of POLICIES) {
  for (let seed = 1; seed <= 30; seed++) {
    let s = newGame({ seed });
    while (!s.over) {
      if (s.phase === 'card') {
        const v = view(s).card;
        const text = [v.title, v.text, ...v.lines, ...v.choices.flatMap((c) => [c.label, c.note, c.stake, c.why])].join(' ');
        const raw = text.match(/\{[a-zA-Z_]+\}|undefined|NaN|\[object Object\]/);
        if (raw) problems.push(`${policy}/${seed} ${v.id}: "${raw[0]}"`);
        if (!v.choices.some((c) => !c.locked)) problems.push(`${policy}/${seed} ${v.id}: every choice locked`);
        if (s.cards[0].beat) {
          fired.set(s.cards[0].beat, (fired.get(s.cards[0].beat) || 0) + 1);
          if (/Ysabel/.test(v.title) && !s.npcs.friend.alive) problems.push(`${policy}/${seed}: Ysabel speaks after leaving the story`);
        }
      }
      s = advance(s, decide(s, policy)).state;
    }
  }
}

test('every beat fires in some game (11 policies x 30 seeds)', () => {
  const never = BEATS.filter((b) => !fired.get(b.id)).map((b) => b.id);
  assert.deepEqual(never, [], `never fired: ${never.join(', ')}`);
});

test('no story card shows a raw token, and every card leaves a way through', () => {
  assert.deepEqual(problems.slice(0, 5), []);
});
