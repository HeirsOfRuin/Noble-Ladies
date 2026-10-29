// Favours owed (docs/FRAME-ROUND3.md). Help given or received is a debt between
// two people, kept in the save:
//   dir 'in'  someone owes her;   dir 'out'  she owes someone.
// weight 1-3 says how much. A debt is called once. She calls in hers in person
// (the call-in action); others call in theirs from her, usually at a bad moment
// (events.js debt_called). A 'hold' is leverage rather than a debt: what she read
// in someone's letters. Calling it in works, and costs her their trust.

import { CAST } from '../data/cast.data.js';
import { SWINGS } from '../data/history.data.js';
import { turnOfKey } from './clock.js';

export function addDebt(s, who, dir, w, why, hold = false) {
  if (!s.npcs[who]?.alive) return null;
  const d = { id: s.nextId++, who, dir, w: Math.max(1, Math.min(3, w)), why, turn: s.turn, hold };
  s.debts.push(d);
  return d;
}

export const debtsIn = (s) => s.debts.filter((d) => d.dir === 'in' && s.npcs[d.who]?.alive);
export const debtsOut = (s) => s.debts.filter((d) => d.dir === 'out' && s.npcs[d.who]?.alive);

export function clearDebt(s, id) { s.debts = s.debts.filter((d) => d.id !== id); }

export const nameOfWho = (s, who) => s.npcs[who]?.name || CAST[who].name;

/** The next swing within four half-years, if any (for news called in as a favour). */
export function nextSwing(s, horizon = 4) {
  return Object.keys(SWINGS).find((k) => { const t = turnOfKey(k); return t > s.turn && t <= s.turn + horizon; }) || null;
}

/** The card she gets when she calls a favour in. */
export function callInCard(s, d) {
  const n = s.npcs[d.who], c = CAST[d.who];
  const f = n.faction === 'none' ? null : n.faction;
  const ask = [];
  ask.push({ label: `Ask for money`, note: `${150 * d.w} livres, discreetly.`, ops: [['purse', 150 * d.w, `${c.short} pays what is owed`], ['clearDebt', d.id]] });
  if (f) ask.push({ label: `Ask for a word on your behalf`, note: `${c.short} speaks for you to ${f === 'queen' ? 'the queen' : 'their party'}.`, ops: [['fav', f, 8 * d.w], ['clearDebt', d.id]] });
  else ask.push({ label: `Ask them to speak well of you`, note: `${c.short} has the ear of people who matter.`, ops: [['rep', 3 * d.w], ['clearDebt', d.id]] });
  ask.push({ label: 'Ask what they know', note: nextSwing(s) ? 'Something is coming, and they are closer to it than you.' : 'There may be nothing to know.', ops: [['warnNext', d.who], ['info', 5 * d.w], ['clearDebt', d.id]] });
  if (d.hold) for (const a of ask) a.ops.push(['trust', d.who, -25]);
  return {
    id: 'callin', title: `${nameOfWho(s, d.who)} owes you`, lines: [],
    text: d.hold
      ? `You have read what ${nameOfWho(s, d.who)} wrote, and ${c.short} knows you have. You need not say it aloud. What do you ask for?`
      : `${nameOfWho(s, d.who)} owes you for ${d.why}. You ask in person, which is the only way to ask for a debt like this. What do you ask for?`,
    choices: ask,
  };
}
