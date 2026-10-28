// sim/adapter.js: connects this game to the game-measure kit (sim/run.js and
// friends). The kit files are not edited per game; this one is.

import { newGame, advance } from '../src/engine/turn.js';
import { FIRST_TURN, LAST_TURN, yearOf } from '../src/engine/clock.js';
import { decide, POLICIES } from './bot.js';

export const axes = { policy: POLICIES, difficulty: ['easy', 'normal', 'hard'] };
export const defaults = { policy: 'christine', difficulty: 'normal' };

export function play(seed, opts = {}) {
  let s = newGame({ seed, difficulty: opts.difficulty || 'normal' });
  for (let guard = 0; !s.over && guard < 5000; guard++) s = advance(s, decide(s, opts.policy || 'christine')).state;
  return s;
}

// A game that did not happen must not be counted (Cradle: campaigns sat on
// turn 1 while the batch reported results).
export function progress(s) {
  const missing = [];
  if (!s.over) missing.push('never ended');
  if (s.turn < FIRST_TURN + 1) missing.push(`never left Act 1 (turn ${s.turn})`);
  const halves = s.history.filter((h) => h.place).length;
  if (s.outcome === 'survived' && halves !== LAST_TURN - FIRST_TURN + 1) missing.push(`survived with ${halves} half-years played`);
  if (!s.ending) missing.push('no ending written');
  return missing;
}

export function metrics(s) {
  const living = s.children.filter((c) => c.alive);
  return {
    survived: s.outcome === 'survived',
    died: s.outcome === 'dead',
    ruined: s.outcome === 'ruined',
    score: s.ending?.total ?? 0,
    lands: s.landsStart ? s.lands - s.landsStart : 0,
    children: living.length,
    placed: living.filter((c) => c.betrothed).length,
    rep: s.rep,
    money: s.money,
    widowed: s.widowed || !!s.flags.remarried,
    killedAt1415: s.flags.agincourt === 'killed',
    pensions: s.pensions.length,
    endYear: yearOf(Math.min(s.turn, LAST_TURN)),
  };
}

export function digest(s) {
  return JSON.stringify([s.outcome, s.turn, s.money, s.rep, s.lands, s.children.length, s.ledger.length, s.ending?.total]);
}

export function trace(s) {
  const out = [];
  for (const h of s.history) {
    if (h.scene) out.push(`${h.date.padEnd(16)} scene   ${h.lines.join(' ')}`);
    else if (h.place) out.push(`${h.date.padEnd(16)} ${h.place.padEnd(8)} ${h.actions.join(',').padEnd(34)} purse ${String(h.money).padStart(6)}  ${h.lines.join(' ')}`);
  }
  out.push(`\n${s.outcome}: score ${s.ending?.total} (${s.ending?.parts.map((p) => `${p.key} ${p.n}`).join(', ')})`);
  out.push(s.ending?.epitaph || '');
  return out.join('\n');
}
