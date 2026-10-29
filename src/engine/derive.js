// Every number the player is shown, computed here and nowhere else. The engine,
// the UI and the bot all ask these functions, so the number shown and the number
// resolved cannot drift (Cradle's threat display read 2.36x while the wall broke
// at full strength; Centennial Farm's planning screen and engine disagreed by 7%).

import { CONFIG, DIFFICULTY, FACTIONS } from '../data/config.data.js';
import { ACTIONS } from '../data/actions.data.js';
import { CAST } from '../data/cast.data.js';
import { SWINGS, PLAGUE } from '../data/history.data.js';
import { onBoard, controlAt, queenSideAt, between, keyOf, factionLabel, turnOfKey } from './clock.js';
import { clamp, TRAITS } from './effects.js';
import { WANTS } from '../data/arcs.data.js';

export const D = (s) => DIFFICULTY[s.difficulty];
export const costOf = (s, n) => Math.round(n * D(s).costMult);
export const pct = (p) => `${Math.round(p * 100)}%`;

// ---- people ---------------------------------------------------------------

/** What she knows of someone's reliability: learned by using them. */
export function relWord(npc) {
  if (npc.seen < 2) return 'untried';
  return npc.rel >= 0.8 ? 'reliable' : npc.rel >= 0.65 ? 'fair' : 'doubtful';
}

export function npcName(id) { return CAST[id]?.name || id; }

/** A person's name as she knows it now (a replaced servant has a new name). */
export function nameOf(s, id) { return s.npcs[id]?.name || CAST[id]?.name || id; }

/** On the board now: alive, and arrived (a real figure's arrival date lives in the cast table). */
export const present = (s, id) => !!s.npcs[id] && !!CAST[id] && onBoard({ alive: s.npcs[id].alive, from: CAST[id].from }, s.turn);

export function patrons(s) {
  return Object.keys(s.npcs).filter((id) => CAST[id].role === 'patron' && present(s, id));
}

export function husbandHere(s) {
  return !!s.husband && s.husband.status === 'present';
}

// ---- money ----------------------------------------------------------------

export function slotsFor(s, place) {
  let n = CONFIG.slots[place];
  if (s.hh < CONFIG.smallHouseholdBelow) n -= 1;
  if (s.widowed && !s.husband) n += 1; // a widow governs her own affairs
  return Math.max(1, n);
}

export function rentsGross(s, place) {
  const hhFactor = 0.7 + 0.3 * (s.hh / 100);
  return Math.round(s.lands * CONFIG.rentPerHolding * CONFIG.presenceRent[place] * hhFactor);
}

export function pensionPays(s, p) {
  if (p.faction === 'queen') return s.fav.queen >= 20 && present(s, 'queen');
  if (p.faction === 'none') return present(s, p.from);
  const c = controlAt(s.turn);
  return c === 'contested' || c === p.faction;
}

export const pensionIncome = (s) => s.pensions.filter((p) => pensionPays(s, p)).reduce((a, p) => a + p.amount, 0);

export function husbandSpend(s) {
  if (!s.husband || s.husband.status !== 'present') return 0;
  return costOf(s, CONFIG.husbandSpendPer * s.husband.spending);
}

export const interestDue = (s) => (s.money < 0 ? Math.round(-s.money * CONFIG.debtInterest) : 0);

/** The placement choice as the plan screen shows it and the turn resolves it. */
export function placePreview(s, place) {
  const rents = rentsGross(s, place);
  const cost = costOf(s, place === 'court' ? CONFIG.courtCost : CONFIG.estatesCost);
  const pensions = pensionIncome(s);
  const spend = husbandSpend(s);
  const interest = interestDue(s);
  const net = rents + pensions - cost - spend - interest;
  const lines = place === 'court'
    ? ['News and favour come to you. You are in Paris if it turns violent.']
    : ['Full rents, rest, repairs. Favour fades and news comes late.'];
  if (s.hh < CONFIG.smallHouseholdBelow) lines.push(`Your household is run down (${s.hh}): one action fewer until it is above ${CONFIG.smallHouseholdBelow}. Time on the estates mends it.`);
  if (s.widowed && !s.husband) lines.push('As a widow you govern your own affairs: one action more.');
  return { place, label: place === 'court' ? 'At court' : 'On the estates', rents, pensions, cost, spend, interest, net, slots: slotsFor(s, place), lines };
}

// ---- actions --------------------------------------------------------------

export function petitionChance(s, id) {
  const n = s.npcs[id];
  const f = n.faction === 'none' ? null : n.faction;
  const favour = f ? s.fav[f] : (s.fav.queen + s.fav.arm + s.fav.bur) / 3;
  const p = (0.15 + favour / 220 + n.trust / 260 + n.use / 400 + s.info / 500) * (0.6 + 0.4 * n.rel);
  return clamp(p, 0.05, 0.85);
}

export function giftGain(s, id) {
  const recent = s.npcs[id].gifts.filter((t) => s.turn - t < 4).length;
  return 1 / (1 + recent);
}

export function correspondents(s) {
  const out = [];
  if (s.husband && s.husband.status !== 'dead') out.push('husband');
  for (const id of ['mother', 'christine', 'friend', ...patrons(s)]) if (present(s, id)) out.push(id);
  return out;
}

export function lawsuitChance(s) {
  const law = s.npcs.lawyer;
  const c = controlAt(s.turn);
  const fav = c === 'contested' ? (s.fav.arm + s.fav.bur) / 2 : s.fav[c];
  return clamp(0.3 + law.rel * 0.3 + fav / 300 + s.rep / 400 - (s.cause?.kind === 'dower' && s.flags.dowerAssigned ? -0.2 : 0), 0.1, 0.9);
}

export function childAge(s, c) { return Math.floor((s.turn - c.born) / 2); }

export function marriageable(s) {
  // Houses that have been answered once do not write again for two years.
  return s.children.filter((c) => c.alive && !c.betrothed && childAge(s, c) >= CONFIG.childOfAge && !(c.asked && s.turn - c.asked < 4));
}

function targetsFor(s, id) {
  const a = ACTIONS[id];
  if (!a.target) return null;
  if (a.target === 'patron') return patrons(s).map((p) => {
    const has = s.pensions.some((x) => x.from === p);
    const pend = s.queue.some((q) => q.kind === 'petition' && q.npc === p);
    return { id: p, label: CAST[p].name, detail: `${pct(petitionChance(s, p))} chance · ${a.pension[s.npcs[p].faction]} a half-year`, ok: !has && !pend, why: has ? 'Already pays you a pension.' : pend ? 'A petition is already waiting for an answer.' : null };
  });
  if (a.target === 'person') return Object.keys(s.npcs).filter((p) => present(s, p) && !['steward', 'maid', 'confessor', 'lawyer'].includes(p)).map((p) => ({ id: p, label: CAST[p].name, detail: `${giftGain(s, p) < 1 ? 'recent gifts dull this one · ' : ''}trust ${s.npcs[p].trust}`, ok: true }));
  if (a.target === 'source') return ['maid', 'friend'].filter((p) => present(s, p)).map((p) => ({ id: p, label: CAST[p].name, detail: relWord(s.npcs[p]), ok: true }));
  if (a.target === 'correspondent') return correspondents(s).map((p) => ({ id: p, label: p === 'husband' ? `Your husband (counsel: ${COUNSEL[s.counsel]})` : CAST[p].name, detail: p === 'husband' ? `he listens: ${heedWord(s)}` : `trust ${s.npcs[p].trust}`, ok: true }));
  if (a.target === 'case') {
    const out = [];
    if (s.cause) out.push({ id: 'cause', label: s.cause.kind === 'dower' ? 'Your dower' : 'Your confiscated lands', detail: `${s.cause.progress} of ${a.stepsToJudgment} hearings; ${pct(lawsuitChance(s))} to win at judgment`, ok: true });
    if (brecourtOpen(s)) out.push({ id: 'brecourt', label: 'Brécourt', detail: `${s.flags.brecourtHearings || 0} hearings pressed; judgment at ${BRECOURT_JUDGMENT}; ${pct(brecourtChance(s))} if judged now`, ok: true });
    return out;
  }
  if (a.target === 'servant') return ['steward', 'maid'].map((p) => ({ id: p, label: `Replace ${nameOf(s, p)}, ${p === 'maid' ? 'your chamberwoman' : 'your steward'}`, detail: relWord(s.npcs[p]), ok: true }));
  if (a.target === 'child') return marriageable(s).map((c) => ({ id: String(c.id), label: `${c.name}, ${childAge(s, c)}`, detail: c.sex === 'daughter' ? 'needs a dowry' : 'brings a dowry in', ok: true }));
  if (a.target === 'amount') {
    const left = s.husband?.ransom ? s.husband.ransom.total - s.husband.ransom.paid : 0;
    return a.amounts.map((n) => Math.min(n, left)).filter((n, i, arr) => n > 0 && arr.indexOf(n) === i).map((n) => ({ id: String(n), label: `${n} livres`, detail: `${left - n} left to pay`, ok: s.money >= n, why: s.money >= n ? null : 'Not enough in the purse.' }));
  }
  return [];
}

export const BRECOURT_JUDGMENT = 6; // hearings before the Parlement judges Brécourt without a crisis to hurry it

export const COUNSEL = { none: 'none given', stay: 'stay out of the armies', arm: 'hold to Orléans', bur: 'hold to Burgundy' };

export function heedWord(s) {
  if (!s.husband) return '-';
  const h = s.husband.heed;
  return h >= 60 ? 'usually' : h >= 35 ? 'sometimes' : 'rarely';
}

/** One action as the plan screen shows it: cost, who carries it out, why it is closed. */
export function actionPreview(s, id, place = s.place) {
  const a = ACTIONS[id];
  if (!a) return null;
  let why = null;
  if (a.where !== 'any' && a.where !== place) why = a.where === 'court' ? 'Only at court.' : 'Only on the estates.';
  else if ((a.from || a.until) && !between(s.turn, a.from, a.until)) why = 'Not in these years.';
  else if (id === 'rumour' && !present(s, 'rival')) why = 'You have no rival at court now.';
  else if (id === 'children' && !s.children.some((c) => c.alive)) why = 'You have no children yet.';
  else if (id === 'lawsuit' && !s.cause && !brecourtOpen(s)) why = 'You have no case before the Parlement.';
  else if (id === 'betroth' && !marriageable(s).length) why = `No child is old enough for a contract (${CONFIG.childOfAge}).`;
  else if (id === 'ransom' && s.husband?.status !== 'captured') why = 'Nobody of yours is held for ransom.';
  else if (id === 'petition' && !patrons(s).length) why = 'No patron is at court.';
  const cost = costOf(s, a.cost);
  if (!why && cost > 0 && s.money < cost) why = `Costs ${cost}; you have ${Math.max(0, s.money)}.`;
  const targets = targetsFor(s, id);
  if (!why && targets && !targets.some((t) => t.ok)) why = targets.length ? (targets[0].why || 'Nobody to ask.') : 'Nobody to ask.';
  const viaId = a.via === 'maid' || a.via === 'steward' || a.via === 'lawyer' || a.via === 'confessor' || a.via === 'mother' ? a.via : null;
  const via = viaId ? { id: viaId, name: CAST[viaId].short, word: relWord(s.npcs[viaId]) } : null;
  let chance = null;
  if (id === 'lawsuit' && s.cause) chance = `${s.cause.progress} of ${a.stepsToJudgment} hearings; ${pct(lawsuitChance(s))} to win at judgment`;
  return { id, label: a.label, note: a.note, cost, ok: !why, why, targets, via, chance, delay: a.delay };
}

// ---- factions -------------------------------------------------------------

/** How tied she is to a side, as the swing will read it (0 to about 1.3). */
export function tie(s, f) {
  if (f === 'queen') return s.fav.queen / 100;
  let t = s.fav[f] / 100;
  if (s.husband && ['present', 'away'].includes(s.husband.status) && s.husband.lean === f) t += 0.3;
  if (queenSideAt(s.turn) === f) t += s.fav.queen / 250;
  return t;
}

export function protector(s) {
  return present(s, 'berry') && s.npcs.berry.trust >= 40;
}

/** What a swing would do to her if it fired with her position as it is now. */
export function swingOutcome(s, key, place = s.place) {
  const w = SWINGS[key];
  const lose = Math.max(...w.losers.map((f) => tie(s, f)));
  const win = tie(s, w.winner);
  let p = clamp(lose - win * 0.6, 0, 1.2) * w.severity * CONFIG.swingSeverity;
  if (protector(s)) p *= 0.6;
  const mod = s.flags.swingMod?.[key];
  if (mod) p *= mod.mult;
  if (place === 'estates') p *= CONFIG.awayFromSwing; // out of sight when the purges come
  const fine = p > 0.1 ? costOf(s, Math.round(p * 1000)) : 0;
  const confiscate = p > 0.8 ? 2 : p > 0.4 ? 1 : 0;
  const harm = place === 'court' && w.danger ? Math.round(p * w.danger * 60 * D(s).dangerMult) : 0;
  const reward = win >= 0.5;
  const spoils = win >= 0.8 ? 1 : 0;     // the winners hand out what they took from the losers
  const lethal = w.danger >= 1;           // only the 1418 massacre kills; earlier risings imprison
  const prison = harm && !lethal ? costOf(s, harm * 10) : 0;
  return { p, fine, confiscate, harm, lethal, prison, reward, spoils, win, lose, modNote: mod?.note || null };
}

/** The House tab's "if Paris changed hands now" lines, one per side. */
export function exposureNow(s) {
  return ['arm', 'bur'].map((f) => {
    const t = tie(s, f);
    return { faction: f, label: factionLabel(f, s.turn, true), tie: Math.round(t * 100), word: t >= 0.7 ? 'bound to them' : t >= 0.4 ? 'known as their friend' : t >= 0.2 ? 'acquainted' : 'a stranger' };
  });
}

/** Her chance of dying if she is in Paris when an epidemic comes (shown on the House tab). */
export function plagueRisk(s, key) {
  return (PLAGUE[key] || 0) * 0.15 * (1.2 - s.health / 100) * D(s).dangerMult;
}

/**
 * Letters of protection. In the war years soldiers of every party lived off the
 * countryside; a house with friends at court could get its villages spared.
 */
export function warProtected(s) {
  const c = controlAt(s.turn);
  const ruling = c === 'contested' ? Math.max(s.fav.arm, s.fav.bur) : s.fav[c];
  return ruling >= 40 || s.fav.queen >= 50 || protector(s);
}

/** The chance soldiers damage her lands this half-year, and of losing a holding outright. */
export function warRisk(s) {
  const p = warProtected(s);
  return { raid: s.guard > 0 ? 0 : p ? 0.12 : 0.4, lose: s.guard > 0 ? 0 : p ? 0 : 0.12, protected: p };
}

export function hedging(s) {
  return s.fav.arm >= CONFIG.hedgeAt && s.fav.bur >= CONFIG.hedgeAt;
}

// ---- score ----------------------------------------------------------------

export function score(s) {
  const lady = s.outcome === 'dead' ? 0 : s.widowed && !s.husband ? 10 : s.flags.convent ? 6 : 7;
  const house = s.landsStart ? Math.round(20 * clamp(s.lands / s.landsStart, 0, 1)) : 0;
  let kids = 0;
  for (const c of s.children) if (c.alive) kids += 2 + (c.betrothed ? c.betrothed.rank * 4 : 0) + Math.round(c.care / 100);
  kids = Math.min(25, kids);
  const want = s.want && wantStatus(s).achieved ? 10 : 0;
  const rep = Math.round(s.rep / 5);
  const wealth = clamp(Math.round((s.money + 2000) / 400), 0, 15);
  const parts = [
    { key: 'house', label: 'The house\'s lands', n: house, of: 20 },
    { key: 'children', label: 'Children living and placed', n: kids, of: 25 },
    { key: 'rep', label: 'Her good name', n: rep, of: 20 },
    { key: 'wealth', label: 'Wealth after debts', n: wealth, of: 15 },
    { key: 'lady', label: 'Her own fate', n: lady, of: 10 },
    { key: 'want', label: s.want ? `What she wanted: ${WANTS[s.want].label}` : 'What she wanted', n: want, of: 10 },
  ];
  const total = parts.reduce((a, p) => a + p.n, 0);
  return { parts, total, grade: total >= 75 ? 'A house that rose' : total >= 55 ? 'A house that held' : total >= 35 ? 'A house diminished' : 'A house undone' };
}

// ---- her own story --------------------------------------------------------

export const brecourtOpen = (s) => !!s.flags.caseBrecourt && !['judged', 'refused', 'shared', 'given', 'seized', 'lost'].includes(s.flags.brecourt);

/** Her chance if the Parlement judged Brécourt now: hearings pressed, witnesses, the 1400 clause. */
export function brecourtChance(s) {
  const c = controlAt(s.turn);
  const fav = c === 'contested' ? (s.fav.arm + s.fav.bur) / 2 : s.fav[c];
  // A case before the Parlement was moved by patrons as much as by hearings: a
  // well-argued case from a lady nobody at court knows still mostly loses.
  let p = 0.04 * Math.min(s.flags.brecourtHearings || 0, 6);
  if (s.flags.witnessThibaut) p += 0.15;
  if (s.flags.witnessRobert) p += 0.08;
  if (s.flags.thibautLost) p -= 0.05;
  if (!s.flags.renounced) p += 0.2;
  if (s.flags.motherCase) p += 0.03;
  p += s.npcs.lawyer.rel * 0.08 + fav / 160 + s.fav.queen / 400;
  return clamp(p, 0.05, 0.9);
}

/** Her ambition, as the House tab shows it and the score counts it. */
export function wantStatus(s) {
  if (!s.want) return null;
  const w = WANTS[s.want];
  let achieved = false, progress = '';
  if (s.want === 'brecourt') {
    achieved = ['judged', 'shared'].includes(s.flags.brecourt);
    progress = { judged: 'Brécourt is yours by judgment.', shared: 'Brécourt will go to your grandchildren, by contract.', seized: 'Brécourt is yours while the Armagnacs hold Paris.', lost: 'Gérard has Brécourt back.', refused: 'The Parlement found against you.', given: 'You let it go.' }[s.flags.brecourt]
      || (s.flags.caseBrecourt ? `Your case: ${s.flags.brecourtHearings || 0} hearings pressed; ${pct(brecourtChance(s))} if judged now.` : s.turn >= turnOfKey('1403b') ? 'Gérard holds Brécourt. No case is open.' : 'Your father still holds Brécourt.');
  } else if (s.want === 'court') {
    achieved = !!s.flags.queensLady;
    progress = achieved ? 'You are one of the queen\'s ladies.' : `Not yet. The queen\'s favour ${s.fav.queen} (she looks for about 60) and a good name (about 50).`;
  } else if (s.want === 'children') {
    const placed = s.children.filter((c) => c.alive && c.betrothed && c.betrothed.rank >= 2).length;
    achieved = placed >= 2;
    progress = `${placed} of 2 children promised to good houses.`;
  } else if (s.want === 'soul') {
    const n = s.flags.chapels || 0;
    achieved = n >= 2 && s.rep >= 60;
    progress = `${n} of 2 chapels endowed; your good name ${s.rep} (it must be 60 at the end).`;
  }
  return { id: s.want, label: w.label, goal: w.goal, progress, achieved };
}

/** What is said of her: her tendencies, in words. */
export function traitWords(s) {
  const out = [];
  for (const [axis, [hi, lo]] of Object.entries(TRAITS)) {
    const v = s.traits?.[axis] ?? 0;
    if (v >= 4) out.push(`very ${hi}`); else if (v >= 2) out.push(hi);
    else if (v <= -4) out.push(`very ${lo}`); else if (v <= -2) out.push(lo);
  }
  return out;
}

export { keyOf, FACTIONS };
