// The chronicle: her life a year at a time, so a 100-minute game can be looked
// back on (The Lists' herald's chronicle, Farmyard's farm book). Built only from
// facts already in the save: where she spent each half-year, the turning points,
// the story choices she made, children born and lost. Nothing is invented here.

import { HISTORY } from '../data/history.data.js';
import { yearOf, keyOf, FIRST_TURN } from './clock.js';
import { words } from './effects.js';
import { ARCS } from '../data/arcs.data.js';

const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);

/** Years so far, newest first: [{ year, lines }]. */
export function chronicle(s) {
  const years = new Map();
  const at = (y) => { if (!years.has(y)) years.set(y, []); return years.get(y); };
  if (s.flags.firstHusband) at(1400).push(`Your father contracted your marriage to ${s.flags.firstHusband}.`);
  const last = Math.min(s.turn - 1, FIRST_TURN + 43);
  for (let y = 1401; y <= yearOf(Math.max(FIRST_TURN, last)); y++) {
    const halves = [FIRST_TURN + (y - 1401) * 2, FIRST_TURN + (y - 1401) * 2 + 1].filter((t) => t <= last);
    if (!halves.length) continue;
    const L = at(y);
    for (const t of halves) { const h = HISTORY[keyOf(t)]; if (h) L.push(`${h.title}.`); }
    const where = halves.map((t) => s.history.find((r) => r.turn === t)?.place).filter(Boolean);
    if (where.length === 2) L.push(where[0] === where[1] ? `You kept the whole year ${where[0] === 'court' ? 'at court' : 'on your estates'}.` : `The summer ${where[0] === 'court' ? 'at court' : 'on your estates'}, the winter ${where[1] === 'court' ? 'at court' : 'on your estates'}.`);
    else if (where.length === 1) L.push(`The summer ${where[0] === 'court' ? 'at court' : 'on your estates'}.`);
    // Each choice under its storyline's name, so "her" and "him" have someone to mean.
    for (const e of (s.story || []).filter((x) => halves.includes(x.turn))) L.push(`${ARCS[e.arc]?.title ? `${ARCS[e.arc].title}: ` : ''}${e.memo}.`);
    const born = s.children.filter((c) => halves.includes(c.born));
    for (const c of born) L.push(`${c.sex === 'son' ? 'A son' : 'A daughter'}, ${c.name}, was born.`);
    const died = s.children.filter((c) => c.died && halves.includes(c.died));
    if (died.length) L.push(`${died.map((c) => c.name).join(' and ')} died${died.length > 1 ? `, ${words(died.length)} in one year` : ''}.`);
  }
  return [...years.entries()].sort((a, b) => b[0] - a[0]).map(([year, lines]) => ({ year, lines }));
}
