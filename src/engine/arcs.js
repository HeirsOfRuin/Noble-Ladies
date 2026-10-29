// The story-beat engine: her own story inside the fixed history
// (docs/FRAME-DEPTH.md). Beats are data (src/data/arcs.data.js); this file
// decides which one fires, builds its card, and works out each choice's odds
// once, when the card is dealt, so they cannot be probed by asking again
// (Touchline's rule for a value drawn once).

import { BEATS, ARCS, WANTS } from '../data/arcs.data.js';
import { CAST } from '../data/cast.data.js';
import { test, all } from './cond.js';
import { applyOps } from './effects.js';
import { turnOfKey, dateLabel, yearOf } from './clock.js';
import { brecourtChance } from './derive.js';

const clampP = (p) => Math.max(0.05, Math.min(0.95, p));

/** A choice's odds from its p spec, with the state as it is when the card is dealt. */
export function chanceOf(s, p) {
  if (typeof p === 'number') return p;
  if (p.brecourt) return brecourtChance(s);
  let x = p.base || 0;
  if (p.heedOnly) return clampP(x + (s.husband?.heed ?? 0) / 100);
  if (p.trust) x += (s.npcs[p.trust]?.trust ?? 0) / 200;
  if (p.fav) x += s.fav[p.fav] / 200;
  if (p.rel) x += (s.npcs[p.rel]?.rel ?? 0) * 0.6;
  if (p.regard) x += (s.husband?.regard ?? 40) / 150;
  if (p.estates && s.place === 'estates') x += p.estates;
  return clampP(x);
}

export function tokens(s) {
  const living = s.children.filter((c) => c.alive);
  const son = living.find((c) => c.sex === 'son');
  return {
    lady: s.lady.name,
    husband: s.husband?.short || s.flags.husbandShort || 'your husband',
    cousin: 'Gérard',
    son: son ? son.name : 'your son',
    child: living[0] ? living[0].name : 'your child',
    mother: 'your mother',
    year: String(yearOf(s.turn)),
  };
}

export function fill(s, text) {
  const t = tokens(s);
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in t ? t[k] : m));
}

export function renderText(s, text) {
  if (typeof text === 'string') return fill(s, text);
  return text.filter((part) => test(s, part.if)).map((part) => fill(s, part.text)).join('\n\n');
}

function buildChoice(s, c) {
  const out = { label: fill(s, c.label), note: c.note ? fill(s, c.note) : '', ops: c.ops || [] };
  if (c.kind) out.kind = c.kind;
  if (c.p !== undefined) out.p = chanceOf(s, c.p);
  if (c.win) out.win = c.win;
  if (c.lose) out.lose = c.lose;
  if (c.via) out.via = c.via;
  if (c.want) out.want = c.want;
  if (c.need && !test(s, c.need)) { out.locked = true; out.why = c.why || 'Not open to you.'; }
  return out;
}

export function beatCard(s, b) {
  const choices = b.choices.filter((c) => test(s, c.show)).map((c) => buildChoice(s, c));
  // Every beat must leave a way through: if every choice is closed, the first opens.
  if (!choices.some((c) => !c.locked)) { delete choices[0].locked; delete choices[0].why; }
  return {
    id: `beat:${b.id}`, beat: b.id, arc: ARCS[b.arc].title, title: b.title, when: dateLabel(s.turn),
    text: renderText(s, b.text), lines: [], choices,
  };
}

/** Beats eligible now: in their window, conditions holding, the first such in each arc. */
export function eligibleBeats(s) {
  const seenArc = new Set();
  const out = [];
  for (const b of BEATS) {
    if (s.arcs[b.id]) continue;
    const from = turnOfKey(b.from), until = turnOfKey(b.until);
    if (s.turn < from || s.turn > until) continue;
    if (!all(s, b.if)) continue;
    if (seenArc.has(b.arc)) continue;
    seenArc.add(b.arc);
    out.push({ b, last: s.turn === until });
  }
  return out;
}

/** Called once a half-year, after the historical clock. Returns how many beats fired. */
export function arcsTurn(s) {
  // Beats whose window has closed without firing are passed by.
  for (const b of BEATS) {
    if (s.arcs[b.id] || s.turn <= turnOfKey(b.until)) continue;
    s.arcs[b.id] = 'skipped';
    if (b.onSkip) applyOps(s, b.onSkip);
  }
  const elig = eligibleBeats(s);
  if (!elig.length) return 0;
  const rank = (e) => (e.last ? 0 : 2) + (ARCS[e.b.arc].spine ? 0 : 1);
  elig.sort((x, y) => rank(x) - rank(y));
  const fire = elig.filter((e, i) => i === 0 || (e.last && i < 2));
  for (const { b } of fire) {
    s.arcs[b.id] = 'done';
    s.cards.push(beatCard(s, b));
  }
  return fire.length;
}

/** The card that asks what she wants, dealt after the wedding. */
export function wantCard(s) {
  return {
    id: 'want', title: 'What you want', when: 'April 1401',
    text: `On the road to your husband's house your governess rides beside the litter for the first league, as far as the parish boundary. "Nobody will ask you what you want," she says. "So decide it now, while you can still hear yourself think, and do not tell anyone."`,
    lines: [], choices: Object.entries(WANTS).map(([id, w]) => ({ label: w.label, note: `${w.goal} ${w.note}`, ops: [], kind: 'want', want: id })),
  };
}

export { CAST };
