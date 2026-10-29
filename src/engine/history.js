// The historical clock firing: turning-point cards, faction swings, the exits of
// the real figures, the act transitions and the great sickness. History is
// fixed; what it costs her is computed from her position (derive.swingOutcome,
// the same function the House tab's exposure lines read).

import { HISTORY, SWINGS, PLAGUE, ACT_CARDS } from '../data/history.data.js';
import { CAST } from '../data/cast.data.js';
import { ACTIONS } from '../data/actions.data.js';
import { coin } from './ledger.js';
import { clamp, gainRep } from './effects.js';
import { keyOf, actOf, factionLabel, dateLabel } from './clock.js';
import { swingOutcome, patrons, plagueRisk } from './derive.js';
import { agincourt } from './family.js';
import { settleNews } from './news.js';
import { marginCard } from './reflect.js';
import { pledgeCard } from './children.js';

function applySwing(s, key, place) {
  const w = SWINGS[key];
  const o = swingOutcome(s, key, place);
  const lines = [];
  const lostOffices = s.offices.filter((o) => w.losers.includes(o.faction));
  if (lostOffices.length) { s.offices = s.offices.filter((o) => !w.losers.includes(o.faction)); lines.push(`${lostOffices.map((o) => o.label).join(' and ')}: taken back by the new council, and counted against you.`.replace(/^./, (c) => c.toUpperCase())); }
  const lost = s.pensions.filter((p) => w.losers.includes(p.faction));
  if (lost.length) {
    s.pensions = s.pensions.filter((p) => !w.losers.includes(p.faction));
    lines.push(`Your pension${lost.length > 1 ? 's' : ''} from ${lost.map((p) => CAST[p.from].short).join(' and ')} stopped.`);
  }
  if (o.fine) { coin(s, -o.fine, `fined by ${factionLabel(w.winner, s.turn)}`); lines.push(`You are counted among their enemies' friends, and fined ${o.fine} livres.`); }
  if (o.confiscate) {
    const n = Math.min(o.confiscate, Math.max(0, s.lands - 2));
    if (n > 0) {
      s.lands -= n;
      s.confiscated.push({ n, by: w.winner, turn: s.turn });
      if (!s.cause) s.cause = { kind: 'confiscation', holdings: n, progress: 0 };
      lines.push(`${n} of your holdings ${n > 1 ? 'are' : 'is'} confiscated and given to one of their captains. A case in the Parlement might recover ${n > 1 ? 'them' : 'it'}.`);
    }
  }
  if (o.harm) {
    gainRep(s, -Math.round(o.harm / 6));
    if (o.lethal) {
      s.health = clamp(s.health - o.harm);
      if (s.health <= 0) { s.over = true; s.outcome = 'dead'; s.flags.death = 'violence'; lines.push('You were in Paris when the prisons were broken open. You did not get out.'); return lines; }
      lines.push(`You were in Paris when it happened. You got out, with your household, barely. Health -${o.harm}.`);
    } else {
      s.health = clamp(s.health - o.harm, Math.min(5, s.health));
      coin(s, -o.prison, 'bought out of the Châtelet');
      lines.push(`You were in Paris when it happened, and were taken with the others. You bought your way out of the Châtelet for ${o.prison} livres. Health -${o.harm}.`);
    }
  }
  if (o.p > 0.05) gainRep(s, -Math.round(o.p * 4));
  if (o.reward) {
    const patron = patrons(s).find((p) => s.npcs[p].faction === w.winner && !s.pensions.some((x) => x.from === p));
    if (patron) {
      const amount = ACTIONS.petition.pension[w.winner];
      s.pensions.push({ from: patron, faction: w.winner, amount });
      lines.push(`The winners remember their friends: a pension of ${amount} livres a half-year from ${CAST[patron].short}.`);
    }
    gainRep(s, 3);
    if (o.spoils) { s.lands += o.spoils; lines.push('You are given a holding confiscated from one of the losers. It is legal, this year.'); }
    // Lands the losers took from her come back.
    const back = s.confiscated.filter((c) => w.losers.includes(c.by));
    for (const c of back) { s.lands += c.n; lines.push(`${c.n} confiscated holding${c.n > 1 ? 's are' : ' is'} restored to you by the new council.`); }
    s.confiscated = s.confiscated.filter((c) => !w.losers.includes(c.by));
    if (s.cause?.kind === 'confiscation' && !s.confiscated.length) s.cause = null;
  }
  if (o.modNote) lines.unshift(o.modNote);
  for (const c of s.children) if (c.alive && c.house && w.losers.includes(c.house)) s.cards.push(pledgeCard(s, c, w.winner));
  if (s.flags.exposedTo && Object.keys(s.flags.exposedTo).length) { if (w.losers.some((f) => s.flags.exposedTo[f])) lines.push('Copies of your letters were in the council\'s hands.'); s.flags.exposedTo = {}; }
  if (!lines.length) lines.push('It passes you by. You were not important enough to punish or to reward.');
  return lines;
}

/** Everything the calendar does in this half-year. Pushes cards. */
export function historyTurn(s, rng, place) {
  const key = keyOf(s.turn);
  const lines = [];

  for (const [id, n] of Object.entries(s.npcs)) {
    if (n.alive && CAST[id].gone === key) {
      n.alive = false; n.gone = key; lines.push(`${CAST[id].name} ${CAST[id].goneHow}.`);
      if (s.pensions.some((p) => p.from === id)) { s.pensions = s.pensions.filter((p) => p.from !== id); lines.push(`Your pension from ${CAST[id].short} ends with it.`); }
    }
  }
  if (key === '1415b') lines.push(...agincourt(s, rng));
  if (SWINGS[key]) lines.push(...applySwing(s, key, place));
  settleNews(s, SWINGS[key] ? key : null);

  if (PLAGUE[key] && place === 'court') {
    // A death roll that rises as her health falls; otherwise she is weakened.
    if (rng.chance(plagueRisk(s, key))) { s.over = true; s.outcome = 'dead'; s.flags.death = 'sickness'; lines.push('The sickness in Paris came into your house. You died of it.'); }
    else {
      const hit = Math.round(20 * PLAGUE[key]);
      s.health = clamp(s.health - hit, Math.min(5, s.health));
      lines.push(`The sickness is in Paris, and in your house. You lived through it. Health -${hit}.`);
    }
  }

  const h = HISTORY[key];
  if (h) s.cards.unshift({ id: `history:${key}`, title: h.title, when: dateLabel(s.turn), history: true, text: h.text, lines, choices: [{ label: 'Continue', ops: [] }] });
  else if (lines.length) s.cards.unshift({ id: `news:${key}`, title: 'News of the half-year', when: dateLabel(s.turn), text: '', lines, choices: [{ label: 'Continue', ops: [] }] });

}

/** The end of an act: her page in the margins, then the next act's card. Dealt after her story beats. */
export function actTurn(s) {
  const nextAct = actOf(s.turn + 1);
  if (!(nextAct > actOf(s.turn) && ACT_CARDS[nextAct])) return;
  if (nextAct >= 3) s.cards.push(marginCard(s, nextAct - 1));
  s.cards.push({ id: `act${nextAct}`, title: `Act ${['', 'One', 'Two', 'Three', 'Four'][nextAct]}`, text: ACT_CARDS[nextAct], choices: [{ label: 'Continue', ops: [] }] });
}
