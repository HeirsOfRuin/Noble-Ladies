// Declarative effects. Act 1 scenes, late consequences, historical cards and
// systemic events all change the game through these ops, so one function both
// applies them and describes them ("At stake" lines are generated from the same
// ops that will be applied: Knight of Adalia's stakes.ts rule).
//
//   ['purse', n, reason]  ['rep', n]  ['fav', faction, n]  ['info', n]
//   ['hh', n]  ['health', n, 'grave'?]  ['trust', npc, n]  ['use', npc, n]
//   (a health loss stops at 1 unless marked grave: small knocks never kill)
//   ['flag', key, value]  ['later', halfKey, cardId]  ['dowry', n]

import { coin } from './ledger.js';
import { turnOfKey } from './clock.js';
import { CAST } from '../data/cast.data.js';
import { FACTIONS } from '../data/config.data.js';

export const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

const STAT = { rep: 'Reputation', info: 'Information', hh: 'Household', health: 'Health' };

/**
 * Reputation is slow to build and quick to lose (brief 6.1): a gain shrinks as
 * her name grows (full below 30, a quarter at 90); a loss is taken in full.
 * Every reputation change in the engine goes through here.
 */
export function gainRep(s, n) {
  const k = n > 0 ? Math.min(1, (110 - s.rep) / 80) : 1;
  const d = Math.round(n * k);
  s.rep = clamp(s.rep + d);
  return d;
}

export function applyOps(s, ops = []) {
  for (const op of ops) {
    const [k, a, b] = op;
    if (k === 'purse') coin(s, a, b || 'expense');
    else if (k === 'rep') gainRep(s, a);
    else if (k === 'health') s.health = clamp(s.health + a, b === 'grave' ? 0 : Math.min(1, s.health)); // only a grave illness can kill
    else if (k in STAT) s[k] = clamp(s[k] + a);
    else if (k === 'fav') s.fav[a] = clamp(s.fav[a] + b);
    else if (k === 'trust' || k === 'use') { const n = s.npcs[a]; if (n && n.alive) n[k] = clamp(n[k] + b); }
    else if (k === 'flag') s.flags[a] = b;
    else if (k === 'later') s.queue.push({ due: turnOfKey(a), kind: 'card', card: b });
    else if (k === 'dowry') s.act1.dowryBonus += a;
    else throw new Error(`unknown effect op: ${k}`);
  }
}

const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

/** One short phrase per op, for "At stake" lines. Ops with no visible stake return null. */
export function describeOp(op) {
  const [k, a, b] = op;
  if (k === 'purse') return `${signed(a)} livres`;
  if (k in STAT) return `${STAT[k]} ${signed(a)}`;
  if (k === 'fav') return `${FACTIONS[a].short} favour ${signed(b)}`;
  if (k === 'trust') return `${CAST[a].short} trusts you ${b > 0 ? 'more' : 'less'}`;
  if (k === 'use') return `${CAST[a].short} ${b > 0 ? 'needs you more' : 'needs you less'}`;
  if (k === 'later') return 'Remembered later';
  if (k === 'dowry') return `Dowry ${signed(a)}`;
  return null;
}

export function describeOps(ops = []) {
  return ops.map(describeOp).filter(Boolean).join(' · ');
}
