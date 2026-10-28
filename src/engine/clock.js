// The calendar. Pure lookups from the turn counter, so every screen, the engine
// and the bot agree on the date, the act and who holds Paris.
//
// Turns 1-7 are the Act 1 scenes (1400). Turn 8 is spring 1401; each turn after
// is a half-year; turn 51 is autumn 1422, the last.

import { CONFIG } from '../data/config.data.js';
import { CONTROL, QUEEN_SIDE, ACTS } from '../data/history.data.js';
import { FACTIONS } from '../data/config.data.js';

export const FIRST_TURN = 1 + 7;            // after the seven Act 1 scenes
export const LAST_TURN = FIRST_TURN + (CONFIG.lastYear - CONFIG.firstYear + 1) * 2 - 1;

export const isAct1 = (turn) => turn < FIRST_TURN;

/** '1407b' for a half-year turn; null during Act 1. */
export function keyOf(turn) {
  if (turn < FIRST_TURN) return null;
  const i = turn - FIRST_TURN;
  return `${CONFIG.firstYear + Math.floor(i / 2)}${i % 2 ? 'b' : 'a'}`;
}

export function turnOfKey(key) {
  const y = Number(key.slice(0, 4)), h = key[4] === 'b' ? 1 : 0;
  return FIRST_TURN + (y - CONFIG.firstYear) * 2 + h;
}

export function yearOf(turn) {
  return turn < FIRST_TURN ? CONFIG.act1Year : CONFIG.firstYear + Math.floor((turn - FIRST_TURN) / 2);
}

/** Her age. Born in January 1383: seventeen through 1400, eighteen at the wedding. */
export function ladyAge(turn) {
  return yearOf(turn) - CONFIG.birthYear;
}

export function dateLabel(turn) {
  if (turn < FIRST_TURN) return `${CONFIG.act1Year}, scene ${turn}`;
  if (turn > LAST_TURN) return `${CONFIG.lastYear}`;
  const i = turn - FIRST_TURN;
  return `${i % 2 ? 'Autumn' : 'Spring'} ${yearOf(turn)}`;
}

export function actOf(turn) {
  if (turn < FIRST_TURN) return 1;
  let act = 2;
  for (const a of ACTS) if (a.from && turnOfKey(a.from) <= turn) act = a.act;
  return act;
}

export const actTitle = (act) => ACTS.find((a) => a.act === act).title;

function lookup(table, turn, fallback) {
  let v = fallback;
  for (const [from, val] of table) if (turnOfKey(from) <= turn) v = val;
  return v;
}

/** Who holds Paris and the council: 'arm' | 'bur' | 'contested'. */
export const controlAt = (turn) => lookup(CONTROL, Math.max(turn, FIRST_TURN), 'contested');
export const queenSideAt = (turn) => lookup(QUEEN_SIDE, Math.max(turn, FIRST_TURN), 'none');

export function factionLabel(f, turn, short = false) {
  const F = FACTIONS[f];
  if (!F) return f === 'none' ? 'no party' : f;
  const late = F.renameYear && yearOf(turn) >= F.renameYear;
  if (short) return late ? F.shortLate : F.short;
  return late ? F.labelLate : F.label;
}

/** Is a cast member on the board this turn (arrived, not yet gone)? */
export function onBoard(npc, turn) {
  if (!npc.alive) return false;
  if (npc.from && turnOfKey(npc.from) > turn) return false;
  return true;
}

export const between = (turn, from, until) => (!from || turnOfKey(from) <= turn) && (!until || turn <= turnOfKey(until));
