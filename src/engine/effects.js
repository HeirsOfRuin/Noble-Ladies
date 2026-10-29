// Declarative effects. Act 1 scenes, story beats, late consequences, historical
// cards and systemic events all change the game through these ops, so one
// function both applies them and describes them ("At stake" lines are generated
// from the same ops that will be applied: Knight of Adalia's stakes.ts rule).
//
//   ['purse', n, reason]  ['rep', n]  ['fav', faction, n]  ['info', n]
//   ['hh', n]  ['health', n, 'grave'?]  ['trust', npc, n]  ['use', npc, n]
//   (a health loss stops at 1 unless marked grave: small knocks never kill)
//   ['flag', key, value]  ['later', halfKey, cardId]  ['dowry', n]
//   ['trait', devout|bold|warm, n]        her character, -5..5
//   ['regard', n]  ['heed', n]             her husband's regard for her, and whether he listens
//   ['lean', faction]                       her husband's party
//   ['lands', n, why]                       holdings gained or lost
//   ['swingMod', halfKey, mult, note]       someone's word makes that swing kinder or harsher
//   ['warn', halfKey, npc]                  a true warning of that swing, from that person
//   ['gone', npc, how]                      someone leaves the story (dies, goes to Burgundy)
//   ['betrothEldest', house, rank, faction] her eldest unpromised child is betrothed there
//   ['count', key, n]                       add to a counter in flags (chapels, hearings)
//   ['spending', n]                         her husband's spending trait, 1-5
//   ['ransomCut', share]                    a share taken off her husband's ransom

import { coin } from './ledger.js';
import { turnOfKey } from './clock.js';
import { CAST } from '../data/cast.data.js';
import { FACTIONS } from '../data/config.data.js';
import { SWINGS } from '../data/history.data.js';

export const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

const STAT = { rep: 'Reputation', info: 'Information', hh: 'Household', health: 'Health' };
export const TRAITS = {
  devout: ['devout', 'worldly'],
  bold: ['bold', 'careful'],
  warm: ['warm', 'cool'],
};

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

const c2 = (op) => op[3];

export function applyOps(s, ops = []) {
  for (const op of ops) {
    const [k, a, b, c] = op;
    if (k === 'purse') coin(s, a, b || 'expense');
    else if (k === 'rep') gainRep(s, a);
    else if (k === 'health') s.health = clamp(s.health + a, b === 'grave' ? 0 : Math.min(1, s.health)); // only a grave illness can kill
    else if (k in STAT) s[k] = clamp(s[k] + a);
    else if (k === 'fav') s.fav[a] = clamp(s.fav[a] + b);
    else if (k === 'trust' || k === 'use') { const n = s.npcs[a]; if (n && n.alive) n[k] = clamp(n[k] + b); }
    else if (k === 'flag') s.flags[a] = b;
    else if (k === 'later') s.queue.push({ due: turnOfKey(a), kind: 'card', card: b });
    else if (k === 'dowry') s.act1.dowryBonus += a;
    else if (k === 'trait') s.traits[a] = clamp((s.traits[a] || 0) + b, -5, 5);
    else if (k === 'regard') { if (s.husband) s.husband.regard = clamp((s.husband.regard ?? 40) + a); }
    else if (k === 'heed') { if (s.husband) s.husband.heed = clamp(s.husband.heed + a); }
    else if (k === 'lean') { if (s.husband) s.husband.lean = a; }
    else if (k === 'lands') s.lands = Math.max(1, s.lands + a);
    else if (k === 'swingMod') { s.flags.swingMod = { ...(s.flags.swingMod || {}) }; s.flags.swingMod[a] = { mult: b, note: c }; }
    else if (k === 'warn') {
      const w = SWINGS[a];
      s.news.push({ id: s.nextId++, turn: s.turn, text: w.warnings[0], src: b, srcLabel: CAST[b].name, srcWord: 'a friend', claim: { winner: w.winner, losers: w.losers }, about: a, truth: true, status: null });
    }
    else if (k === 'gone') { const n = s.npcs[a]; if (n && n.alive) { n.alive = false; n.gone = 'story'; n.goneHow = b; s.pensions = s.pensions.filter((p) => p.from !== a); } }
    else if (k === 'betrothEldest') {
      const c = s.children.filter((x) => x.alive && !x.betrothed).sort((x, y) => x.born - y.born)[0];
      if (c) c.betrothed = { name: a, rank: b, faction: c2(op) };
    }
    else if (k === 'count') s.flags[a] = (s.flags[a] || 0) + b;
    else if (k === 'spending') { if (s.husband) s.husband.spending = Math.max(1, Math.min(5, s.husband.spending + a)); }
    else if (k === 'ransomCut') { if (s.husband?.ransom) s.husband.ransom.total = Math.round(s.husband.ransom.total * (1 - a)); }
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
  if (k === 'trait') return `${b > 0 ? TRAITS[a][0] : TRAITS[a][1]}`;
  if (k === 'regard') return `He thinks ${a > 0 ? 'more' : 'less'} of you`;
  if (k === 'heed') return a > 0 ? 'He will listen more' : 'He will listen less';
  if (k === 'lands') return `${signed(a)} holding${Math.abs(a) > 1 ? 's' : ''}`;
  if (k === 'swingMod' || k === 'warn') return 'Remembered later';
  if (k === 'betrothEldest') return 'Your eldest betrothed';
  if (k === 'spending') return a < 0 ? 'He spends less' : 'He spends more';
  if (k === 'ransomCut') return `Ransom −${Math.round(a * 100)}%`;
  return null;
}

export function describeOps(ops = []) {
  return [...new Set(ops.map(describeOp).filter(Boolean))].join(' · ');
}

/** Flags an op list sets (for the validator). */
export function flagsSet(ops = [], out = new Set()) {
  for (const [k, a] of ops) if (k === 'flag' || k === 'count') out.add(a);
  return out;
}
