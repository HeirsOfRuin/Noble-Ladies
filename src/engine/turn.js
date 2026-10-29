// The turn pipeline and the facade: newGame, advance, view. Pure: no DOM, no
// Date.now(), no Math.random(). Same seed + same inputs = same game.
//
// Inputs, by phase:
//   scene  { type: 'scene', choice }                        Act 1
//   plan   { type: 'plan', place, actions: [{ id, target }] } a half-year
//   card   { type: 'card', choice }                          an event or a turning point
//
// A half-year resolves in this written order (F22: ordering bugs are a class):
//   1. her actions   2. delayed results due now   3. rents and costs
//   4. drift         5. the family                6. the historical clock
//   7. news          8. one systemic event        9. death and ruin
// The turn report is read off the ledger and the lines each phase wrote.

import { CONFIG } from '../data/config.data.js';
import { ACTIONS, ACTION_ORDER } from '../data/actions.data.js';
import { SUITORS } from '../data/cast.data.js';
import { streamFor } from './rng.js';
import { coin, turnAccount } from './ledger.js';
import { newGame, makeNpc } from './state.js';
import { applyOps, describeOps, clamp } from './effects.js';
import { turnOfKey, FIRST_TURN, LAST_TURN, isAct1, dateLabel, actOf, actTitle, ladyAge, keyOf, controlAt, factionLabel } from './clock.js';
import { coloursOpen, COLOURS, traitWords, wantStatus, brecourtOpen, brecourtChance, BRECOURT_JUDGMENT, warRisk, placePreview, actionPreview, rentsGross, slotsFor, costOf, pct, exposureNow, hedging, nameOf, COUNSEL, heedWord, relWord, pensionPays, childAge, score } from './derive.js';
import { sceneView, resolveScene } from './act1.js';
import { resolveAction, resolveDue } from './actions.js';
import { familyTurn, birthRisk, childRisk, WAR } from './family.js';
import { historyTurn, actTurn } from './history.js';
import { arcsTurn } from './arcs.js';
import { debtsIn, debtsOut } from './favours.js';
import { WANTS } from '../data/arcs.data.js';
import { ambientNews, addNews, liveWarnings } from './news.js';
import { eventsTurn, queuedCard, appatisCard } from './events.js';
import { finish } from './ending.js';
import { CAST } from '../data/cast.data.js';

export { newGame };

const MULTI = new Set(['gift', 'letter', 'distance']); // may be taken twice in a half-year, for different people

/** What a plan will cost up front (actions and ransom payments). */
export function planCost(s, place, actions = []) {
  let n = 0;
  for (const a of actions) {
    const p = actionPreview(s, a.id, place);
    if (p) n += p.cost + (a.id === 'ransom' ? Number(a.target) || 0 : 0);
  }
  return n;
}

/** Why a plan is refused, or null. The UI never offers what this refuses. */
export function planProblem(s, input) {
  const place = input.place;
  if (place !== 'court' && place !== 'estates') return 'Choose court or the estates.';
  const acts = input.actions || [];
  if (acts.length > slotsFor(s, place)) return `Only ${slotsFor(s, place)} actions this half-year.`;
  const seen = new Set();
  for (const a of acts) {
    const p = actionPreview(s, a.id, place);
    if (!p) return `Unknown action: ${a.id}`;
    if (!p.ok) return `${p.label}: ${p.why}`;
    if (p.targets) {
      const t = p.targets.find((x) => x.id === String(a.target));
      if (!t) return `${p.label}: choose whom.`;
      if (!t.ok) return `${p.label}: ${t.why}`;
    }
    const k = MULTI.has(a.id) ? `${a.id}:${a.target}` : a.id;
    if (seen.has(k)) return `${p.label} is already in the plan.`;
    seen.add(k);
  }
  const spend = planCost(s, place, acts);
  if (spend > Math.max(0, s.money)) return `The plan costs ${spend}; the purse holds ${Math.max(0, s.money)}.`;
  return null;
}

function income(s, rng, place, ctx, lines) {
  const gross = rentsGross(s, place);
  coin(s, gross, 'rents');
  if (ctx.accounts) coin(s, Math.round(gross * ACTIONS.accounts.rentBonus), 'rents recovered in the accounts');
  const st = s.npcs.steward;
  const skim = ctx.accounts ? 0 : Math.round(gross * (1 - st.rel) * (place === 'court' ? 0.5 : 0.15));
  if (skim > 0) coin(s, -skim, 'rents short');
  s.flags.lastSkim = skim;
  if (WAR.has(keyOf(s.turn))) {
    const w = warRisk(s);
    if (s.guard > 0) lines.push('Soldiers passed near your lands. The watch you set kept them off.');
    else if (rng.chance(w.demand)) s.cards.push(appatisCard(s, rng, gross, w));
    else if (w.protected) lines.push('Soldiers passed near your lands. Your letters of protection were honoured.');
  }
  if (s.guard > 0) s.guard -= 1;
  for (const p of s.pensions) if (pensionPays(s, p)) coin(s, p.amount, `pension from ${CAST[p.from].short}`);
  const pv = placePreview(s, place);
  coin(s, -pv.cost, place === 'court' ? 'the cost of court' : 'the household on the estates');
  if (pv.spend) coin(s, -pv.spend, 'your husband\'s spending');
  if (s.money < 0) coin(s, -Math.round(-s.money * CONFIG.debtInterest), 'interest on debts');
}

function drift(s, place) {
  for (const f of ['queen', 'arm', 'bur']) s.fav[f] = clamp(s.fav[f] - CONFIG.favourDecay[place]);
  // Her household's badge, worn at court: that side notices, and so does the other.
  if (place === 'court' && s.colours !== 'none') { s.fav[s.colours] = clamp(s.fav[s.colours] + 3); const o = s.colours === 'arm' ? 'bur' : 'arm'; s.fav[o] = clamp(s.fav[o] - 2); }
  const cap = CONFIG.infoCap[place];
  const d = CONFIG.infoDrift[place];
  s.info = d > 0 ? Math.max(s.info, Math.min(cap, s.info + d)) : clamp(s.info + d);
  s.hh = clamp(s.hh + CONFIG.householdDrift[place]);
  if (place === 'estates' && s.rep > CONFIG.countryRep) s.rep -= 1;
  const target = CONFIG.healthTarget[place], step = CONFIG.healthStep[place];
  s.health = s.health < target ? Math.min(target, s.health + step) : Math.max(target, s.health - step);
}

function resolveHalfYear(s, input) {
  const place = input.place;
  const r = (label) => streamFor(s.seed, s.turn, label);
  const ctx = {};
  const lines = [];
  s.place = place;

  for (const a of input.actions || []) resolveAction(s, a, r('action:' + a.id), lines, ctx);

  const due = s.queue.filter((q) => q.due <= s.turn);
  s.queue = s.queue.filter((q) => q.due > s.turn);
  const dr = r('due');
  for (const q of due) {
    if (q.kind === 'card') { const c = queuedCard(s, q.card, dr); if (c) s.cards.push(c); }
    else resolveDue(s, q, dr, lines);
  }

  income(s, r('income'), place, ctx, lines);
  drift(s, place);
  lines.push(...familyTurn(s, r('family'), place, ctx));
  if (!s.over) historyTurn(s, r('history'), place);
  const beats = s.over ? 0 : arcsTurn(s);
  ambientNews(s, r('news'), place);
  if (!s.over) eventsTurn(s, r('events'), place, beats);
  if (!s.over) actTurn(s);

  if (!s.over && s.health <= 0) { s.over = true; s.outcome = 'dead'; s.flags.death = 'illness'; }
  if (!s.over && s.money < CONFIG.ruinDebt) { s.over = true; s.outcome = 'ruined'; }

  const record = { turn: s.turn, date: dateLabel(s.turn), place, actions: (input.actions || []).map((a) => a.id), lines, account: turnAccount(s, s.turn), money: s.money };
  s.history.push(record);
  s.turn += 1;
  return record;
}

function settlePhase(s) {
  if (s.over) return finish(s);
  if (s.cards.length) { s.phase = 'card'; return s; }
  if (s.turn > LAST_TURN) return finish(s, 'survived');
  s.phase = isAct1(s.turn) ? 'scene' : 'plan';
  return s;
}

function remarry(s, id, rng) {
  const t = SUITORS.find((x) => x.id === id);
  s.husband = { id: t.id, name: t.name, short: t.short, lean: t.lean, competence: t.competence, loyalty: t.loyalty, temper: t.temper, spending: t.spending, heed: 25, status: 'present', away: 0, ransom: null };
  s.widowed = false;
  s.flags.remarried = true;
  s.flags.secondHusband = t.name;
  s.lands += 4; // his own lands join the household
  s.landsStart += 4;
  return rng;
}

function resolveCard(s, idx) {
  const card = s.cards[0];
  const c = card?.choices[idx];
  if (!c) throw new Error(`no such choice: ${idx}`);
  if (c.locked) throw new Error(`not allowed: ${c.why}`);
  s.cards.shift();
  const rng = streamFor(s.seed, s.turn * 100 + s.nextId, `card:${card.id}`);
  s.nextId += 1;
  const lines = [];
  applyOps(s, c.ops);
  const k = c.kind;
  if (k === 'chance') {
    const won = rng.chance(c.p);
    if (c.via) s.npcs[c.via].seen += 1;
    applyOps(s, won ? c.win : c.lose);
    if (!won && c.loseKind === 'settle') s.lands = Math.max(1, s.lands - c.holdings);
    lines.push(won ? 'It went as you hoped.' : 'It went badly.');
  } else if (k === 'replace') {
    const n = makeNpc(c.who, rng); n.name = rng.pick(['Colin Ravier', 'Thibaut Hennequin', 'Gilet Poulain']); n.seen = 0; s.npcs[c.who] = n;
  } else if (k === 'warn_steward') {
    s.npcs.steward.rel = Math.min(0.95, Math.round((s.npcs.steward.rel + 0.1) * 100) / 100);
  } else if (k === 'stay') {
    if (rng.chance(c.p)) { s.husband.stay = true; lines.push(`${s.husband.short} stays home.`); }
    else { s.husband.heed = clamp(s.husband.heed - 5); lines.push(`${s.husband.short} goes anyway.`); }
  } else if (k === 'christine') {
    addNews(s, rng, { quality: 0.85, src: 'christine', horizon: 4 });
  } else if (k === 'remarry') {
    remarry(s, c.suitor, rng);
  } else if (k === 'cause') {
    s.cause = s.cause ? { ...s.cause, holdings: s.cause.holdings + c.holdings } : { kind: 'dower', holdings: c.holdings, progress: 0 };
    s.lands = Math.max(1, s.lands - c.holdings); // held by his brother until judgment
  } else if (k === 'settle') {
    s.lands = Math.max(1, s.lands - c.holdings);
  } else if (k === 'nurse' || k === 'ownMilk') {
    const child = s.children.find((x) => x.id === c.child);
    if (child) { child.care = clamp(child.care + (k === 'nurse' ? 8 : 15), 0, 100); child.nurse = k === 'nurse'; }
  } else if (k === 'want') {
    s.want = c.want;
    lines.push(`You want ${WANTS[c.want].goal.charAt(0).toLowerCase()}${WANTS[c.want].goal.slice(1)}`);
  } else if (k === 'match') {
    const child = s.children.find((x) => x.id === c.child);
    if (child) child.betrothed = { name: c.house.name, rank: c.house.rank, faction: c.house.faction };
  }
  if (s.money < CONFIG.ruinDebt) { s.over = true; s.outcome = 'ruined'; }
  return { turn: s.turn, card: card.id, choice: idx, lines };
}

/** advance(state, input) -> { state, record }. Throws on anything the view would not offer. */
export function advance(prev, input) {
  if (prev.over) throw new Error('the game is over');
  const s = structuredClone(prev);
  let record;
  if (s.phase === 'scene') {
    if (input?.type !== 'scene') throw new Error('a scene is waiting for a choice');
    const lines = resolveScene(s, input.choice, streamFor(s.seed, s.turn, 'scene'));
    if (s.turn === FIRST_TURN - 1) s.flags.firstHusband = s.husband.name;
    record = { turn: s.turn, date: dateLabel(s.turn), scene: s.turn, lines, account: {} };
    s.history.push(record);
    s.turn += 1;
  } else if (s.phase === 'card') {
    if (input?.type !== 'card') throw new Error('a card is waiting for a choice');
    record = resolveCard(s, input.choice);
  } else if (s.phase === 'plan' && input?.type === 'colours') {
    if (!coloursOpen(s) || !['none', 'arm', 'bur'].includes(input.value)) throw new Error('not allowed: household colours are not worn yet');
    s.colours = input.value;
    return { state: s, record: { turn: s.turn, colours: input.value, lines: [] } };
  } else if (s.phase === 'plan' && input?.type === 'counsel') {
    if (!COUNSEL[input.value]) throw new Error(`unknown counsel: ${input.value}`);
    if (!s.husband) throw new Error('not allowed: you have no husband to counsel');
    s.counsel = input.value;
    return { state: s, record: { turn: s.turn, counsel: input.value, lines: [] } };
  } else if (s.phase === 'plan') {
    if (input?.type !== 'plan') throw new Error('the half-year needs a plan');
    const why = planProblem(s, input);
    if (why) throw new Error(`not allowed: ${why}`);
    record = resolveHalfYear(s, input);
  } else throw new Error(`no input expected in phase ${s.phase}`);
  settlePhase(s);
  return { state: s, record };
}

function cardStake(s, c) {
  const k = c.kind;
  const base = describeOps(c.ops);
  let extra = '';
  if (k === 'chance') extra = `${pct(c.p)} chance${c.via ? `, through ${nameOf(s, c.via)} (${relWord(s.npcs[c.via])})` : ''}: ${describeOps(c.win) || 'nothing lost'}; otherwise ${describeOps(c.lose) || (c.loseKind === 'settle' ? `lose ${c.holdings} holdings` : 'nothing gained')}`;
  else if (k === 'replace') extra = 'A new steward, untried';
  else if (k === 'warn_steward') extra = 'He may be more careful';
  else if (k === 'stay') extra = `${pct(c.p)} he listens`;
  else if (k === 'remarry') extra = 'A husband again: his lands join yours, his decisions bind you';
  else if (k === 'cause') extra = `A case in the Parlement over ${c.holdings} holdings, held by his brother until judgment`;
  else if (k === 'settle') extra = `Lose ${c.holdings} holding${c.holdings > 1 ? 's' : ''}`;
  else if (k === 'match') extra = 'Betrothed';
  else if (k === 'christine') extra = 'What she knows';
  else if (k === 'want') extra = '';
  return [base, extra].filter(Boolean).join(' · ');
}

/** Everything the UI shows, computed by the engine. The UI computes nothing. */
export function view(s) {
  const v = {
    phase: s.phase, turn: s.turn, date: dateLabel(Math.min(s.turn, LAST_TURN)), act: actOf(Math.min(s.turn, LAST_TURN)),
    actTitle: actTitle(actOf(Math.min(s.turn, LAST_TURN))), age: ladyAge(Math.min(s.turn, LAST_TURN)), lastTurn: LAST_TURN, firstTurn: FIRST_TURN,
    money: s.money, rep: s.rep, health: s.health, info: s.info, hh: s.hh, fav: { ...s.fav },
    over: s.over, outcome: s.outcome, ending: s.ending,
    last: s.history[s.history.length - 1] || null,
  };
  if (s.phase === 'scene') v.scene = sceneView(s);
  if (s.phase === 'card') {
    const c = s.cards[0];
    v.card = { id: c.id, title: c.title, when: c.when || dateLabel(s.turn - 1), text: c.text, lines: c.lines || [], history: !!c.history, arc: c.arc || null, margin: !!c.margin,
      choices: c.choices.map((x) => ({ label: x.label, note: x.note || '', stake: x.locked ? '' : cardStake(s, x), locked: !!x.locked, why: x.why || '' })) };
    v.cardsLeft = s.cards.length;
  }
  if (s.phase === 'plan') {
    const places = ['court', 'estates'].map((p) => ({ ...placePreview(s, p), actions: ACTION_ORDER.map((id) => actionPreview(s, id, p)) }));
    v.plan = { places, current: s.place, control: controlAt(s.turn), controlLabel: controlAt(s.turn) === 'contested' ? 'contested between the princes' : `held by ${factionLabel(controlAt(s.turn), s.turn)}`, warnings: liveWarnings(s).map((n) => n.text) };
  }
  return v;
}

/** The House tab: her household, her husband, her children, her standing. */
export function houseView(s) {
  const h = s.husband;
  return {
    lady: s.lady, age: ladyAge(Math.min(s.turn, LAST_TURN)), lands: s.lands, landsStart: s.landsStart,
    husband: h ? { name: h.name, status: h.status, lean: h.lean === 'none' ? 'no party' : factionLabel(h.lean, s.turn), heed: heedWord(s), ransom: h.ransom, traits: { competence: h.competence, loyalty: h.loyalty, temper: h.temper, spending: h.spending } } : null,
    widowed: s.widowed, counsel: s.counsel, counselOptions: COUNSEL,
    children: s.children.map((c) => ({ id: c.id, name: c.name, sex: c.sex, age: childAge(s, c), alive: c.alive, care: c.care, betrothed: c.betrothed, risk: childRisk(s, c) })),
    pregnant: !!s.pregnant, birthRisk: { court: birthRisk(s, 'court'), estates: birthRisk(s, 'estates') },
    pensions: s.pensions.map((p) => ({ from: CAST[p.from].name, amount: p.amount, paying: pensionPays(s, p) })),
    exposure: exposureNow(s), hedging: hedging(s), cause: s.cause, confiscated: s.confiscated,
    score: s.landsStart ? score(s) : null,
    said: traitWords(s), want: wantStatus(s),
    regard: h ? regardWord(h.regard ?? 40) : null,
    brecourt: brecourtLine(s),
    colours: s.colours, coloursOpen: coloursOpen(s), coloursOptions: Object.fromEntries(Object.entries(COLOURS).map(([k, f]) => [k, f(s)])),
    owedToYou: debtsIn(s).map((d) => ({ who: nameOf(s, d.who), why: d.why, w: d.w, hold: d.hold })),
    youOwe: debtsOut(s).map((d) => ({ who: nameOf(s, d.who), why: d.why, w: d.w })),
  };
}

const regardWord = (r) => (r >= 65 ? 'He trusts your judgment.' : r >= 45 ? 'He respects you.' : r >= 30 ? 'He is civil to you.' : 'You are strangers under one roof.');

function brecourtLine(s) {
  if (s.turn < turnOfKey('1403a')) return 'Your father holds Brécourt.';
  const b = s.flags.brecourt;
  if (b) return { judged: 'Brécourt is yours, by judgment of the Parlement.', seized: 'Brécourt is yours, by grant of the Armagnac council. It will last as long as they do.', lost: 'Gérard holds Brécourt again.', refused: 'The Parlement found for Gérard. He holds Brécourt.', shared: 'Brécourt will pass to your grandchildren, by contract with Gérard\'s house.', given: 'You have let Brécourt go.' }[b];
  if (brecourtOpen(s)) return `Gérard holds Brécourt. Your case: ${s.flags.brecourtHearings || 0} of ${BRECOURT_JUDGMENT} hearings pressed; ${pct(brecourtChance(s))} if judged now. Press it with the lawsuit action.`;
  return 'Gérard holds Brécourt. No case is open against him.';
}

export function peopleView(s) {
  return Object.keys(s.npcs).map((id) => {
    const n = s.npcs[id], c = CAST[id];
    return { id, name: nameOf(s, id), role: c.role, note: c.note, real: !!c.real, faction: n.faction === 'none' ? 'no party' : factionLabel(n.faction, s.turn, true), trust: n.trust, use: n.use, word: relWord(n), alive: n.alive, gone: n.gone, goneHow: c.goneHow, onBoard: n.alive && (!c.from || keyOf(s.turn) >= c.from) };
  });
}

export function newsView(s) {
  return s.news.slice().reverse().map((n) => ({ id: n.id, date: dateLabel(n.turn), text: n.text, from: n.srcLabel, word: n.srcWord, status: n.status }));
}

export { costOf };
