// The reference players. They do not need to play WELL; they need to play
// CONSISTENTLY, so runs are comparable. Rules:
//  - They act only through what the view offers, so a choice the screen allows
//    but the engine refuses is caught.
//  - They answer every decision explicitly (scenes, plans, every card).
//  - They read news only through its claim (what the words say), never the
//    hidden truth.
//
// Policies (the kill gate's fixed strategies):
//   courtier   always at court; the queen, petitions, the Court of Love
//   homebody   always on the estates; accounts, tenants, children, rest
//   orleans    court, all in on Orléans / the Armagnacs
//   burgundy   court, all in on Burgundy
//   hedger     court, gifts to both parties
//   christine  adaptive, after the Treasure: court when the purse allows,
//              estates when it does not or when warned; neutral patrons;
//              counsels her husband to stay out of the armies; assigns the dower
//   deaf       christine, but ignores every warning (measures what news is worth)
//   loyal_arm  christine's discipline (purse, health, warnings), but all in on
//   loyal_bur  one party: the sensible partisan, against the reckless one above
//   seasonal   court every spring, the estates every autumn, whatever happens;
//              christine's actions in each place
//   random     any allowed choice
// What none of them does: spread rumours (except random), replace servants
// except when a card offers it, or endow chapels below 2,500 livres.

import { view, advance, houseView, planProblem } from '../src/engine/turn.js';
import { streamFor } from '../src/engine/rng.js';
import { tie } from '../src/engine/derive.js';
import { liveWarnings } from '../src/engine/news.js';

export const POLICIES = ['courtier', 'homebody', 'orleans', 'burgundy', 'hedger', 'christine', 'deaf', 'loyal_arm', 'loyal_bur', 'seasonal', 'random'];
// Any adaptive policy with '+deaf' appended plays the same but ignores all news:
// the pair measures what information is worth to that player (sim/run.js --policy=loyal_bur+deaf).

const SIDE = { orleans: 'arm', burgundy: 'bur', loyal_arm: 'arm', loyal_bur: 'bur' };
const ADAPTIVE = new Set(['christine', 'deaf', 'loyal_arm', 'loyal_bur', 'seasonal']);

// ---- Act 1 ----------------------------------------------------------------

function sceneChoice(s, v, policy, rng) {
  const id = v.scene.id;
  const n = v.scene.choices.length;
  if (policy === 'random') return rng.int(n);
  const su = s.act1.suitors;
  const leanPick = (f) => { const i = su.findIndex((x) => x.lean === f); return i >= 0 ? i : 2; };
  const table = {
    courtier: { offers: 1, court: 0, servants: 2, choice: 2, persuade: 0, quarrel: 0, contract: 2 },
    homebody: { offers: 0, court: 0, servants: 1, choice: 2, persuade: 0, quarrel: 2, contract: 1 },
    orleans: { offers: 1, court: 1, servants: 2, choice: leanPick('arm'), persuade: 0, quarrel: 1, contract: 1 },
    burgundy: { offers: 1, court: 2, servants: 2, choice: leanPick('bur'), persuade: 0, quarrel: 1, contract: 1 },
    hedger: { offers: 1, court: 0, servants: 2, choice: 2, persuade: 0, quarrel: 2, contract: 2 },
    christine: { offers: 0, court: 0, servants: 1, choice: 2, persuade: 0, quarrel: 2, contract: 0 },
  };
  const t = table[policy === 'deaf' || policy === 'seasonal' ? 'christine' : policy === 'loyal_arm' ? 'orleans' : policy === 'loyal_bur' ? 'burgundy' : policy];
  return Math.min(n - 1, t[id]);
}

// ---- cards ----------------------------------------------------------------

function opValue(op, policy) {
  const [k, a, b] = op;
  const side = SIDE[policy];
  if (k === 'purse') return a * 0.012;
  if (k === 'rep') return a;
  if (k === 'fav') return b * (side ? (a === side ? 0.8 : 0.05) : policy === 'hedger' ? 0.5 : a === 'queen' ? 0.5 : 0.25);
  if (k === 'info') return a * 0.2;
  if (k === 'hh') return a * 0.3;
  if (k === 'health') return a * 0.4;
  if (k === 'trust') return b * 0.15;
  if (k === 'use') return b * 0.1;
  if (k === 'later') return -0.5;
  return 0;
}

const opsValue = (ops, policy) => (ops || []).reduce((t, o) => t + opValue(o, policy), 0);

function cardChoice(s, policy, rng) {
  const card = s.cards[0];
  if (policy === 'random') return rng.int(card.choices.length);
  const careful = policy === 'christine' || policy === 'deaf' || policy === 'seasonal';
  let best = 0, bestV = -Infinity;
  card.choices.forEach((c, i) => {
    let val = opsValue(c.ops, policy);
    if (c.kind === 'chance') val += c.p * opsValue(c.win, policy) + (1 - c.p) * (opsValue(c.lose, policy) - (c.loseKind === 'settle' ? c.holdings * 6 : 0));
    if (c.kind === 'replace') val += s.npcs[c.who].seen >= 2 && s.npcs[c.who].rel < 0.65 ? 3 : -1;
    if (c.kind === 'warn_steward') val += 1;
    if (c.kind === 'stay') val += careful ? 4 : -1;
    if (c.kind === 'remarry') val += careful ? -4 : 1;
    if (c.kind === 'cause') val += s.money >= 600 ? 5 : -5;
    if (c.kind === 'settle') val -= c.holdings * 6;
    // A placed child is the house's future: worth far more than the dowry's livres,
    // unless paying it would sink the house.
    if (c.kind === 'match') val += 10 + c.house.rank * 12 + (s.money + c.ops[0][1] > -1500 ? 0 : -60);
    if (c.kind === 'christine') val += 1;
    if (c.ops?.some((o) => o[0] === 'flag' && o[1] === 'convent')) val += careful ? -2 : -6;
    if (val > bestV) { bestV = val; best = i; }
  });
  return best;
}

// ---- half-year plans ------------------------------------------------------

function pickTarget(p, prefer) {
  if (!p || !p.targets) return undefined;
  const ok = p.targets.filter((t) => t.ok);
  for (const f of prefer || []) { const t = ok.find(f); if (t) return t.id; }
  return ok[0]?.id;
}

function warned(s) {
  // A warning she believes: the side it says will win is one she is weaker with.
  for (const w of liveWarnings(s)) {
    const lose = Math.max(...w.claim.losers.map((f) => tie(s, f)));
    if (lose > tie(s, w.claim.winner)) return w.claim;
  }
  return null;
}

function plan(s, v, policy, rng, deafened = false) {
  const byPlace = Object.fromEntries(v.plan.places.map((p) => [p.place, p]));
  let place;
  const claim = !deafened && (policy === 'christine' || policy.startsWith('loyal')) ? warned(s) : null;
  if (policy === 'random') place = rng.pick(['court', 'estates']);
  else if (policy === 'homebody') place = 'estates';
  else if (policy === 'seasonal') place = s.turn % 2 === 0 ? 'court' : 'estates';
  else if (ADAPTIVE.has(policy)) place = claim || s.money < 700 || s.health < 40 || s.hh < 35 ? 'estates' : 'court';
  else place = 'court';
  const P = byPlace[place];
  const ok = Object.fromEntries(P.actions.filter((a) => a.ok).map((a) => [a.id, a]));
  const want = [];
  const add = (id, target) => { if (ok[id] && want.length < P.slots && !want.some((w) => w.id === id && w.target === target)) want.push({ id, target }); };
  const patron = (f) => (t) => s.npcs[t.id]?.faction === f;

  if (policy === 'random') {
    const ids = rng.shuffle(Object.keys(ok));
    for (const id of ids) add(id, pickTarget(ok[id]) ?? (ok[id].targets ? undefined : undefined));
  } else {
    // Obligations first, for every policy.
    if (ok.ransom) add('ransom', pickTarget(ok.ransom, [(t) => t.ok && Number(t.id) <= s.money - 300, () => true]));
    if (ok.lawsuit) add('lawsuit');
    if (ok.betroth) add('betroth', pickTarget(ok.betroth));
    if (policy === 'courtier') { add('attend'); add('petition', pickTarget(ok.petition, [patron('queen')])); add('courtly'); add('gossip', pickTarget(ok.gossip)); add('gift', 'queen'); }
    else if (SIDE[policy] && !ADAPTIVE.has(policy)) {
      const f = SIDE[policy];
      add('petition', pickTarget(ok.petition, [patron(f)]));
      add('gift', pickTarget(ok.gift, [patron(f), (t) => s.npcs[t.id]?.faction === f]));
      add('attend'); add('gossip', pickTarget(ok.gossip));
    } else if (policy === 'hedger') {
      add('courtly');
      add('gift', pickTarget(ok.gift, [s.fav.arm <= s.fav.bur ? patron('arm') : patron('bur')]));
      add('petition', pickTarget(ok.petition));
      add('attend');
    } else if (policy === 'homebody') {
      add('accounts'); if (s.health < 60) add('rest'); add('children'); add('tenants'); add('repair');
    } else { // christine, deaf, loyal_*
      const side = SIDE[policy];
      if (place === 'estates') {
        add('accounts'); if (s.health < 60) add('rest'); if (s.hh < 50) add('repair'); add('children'); add('tenants');
        if (claim) add('gift', pickTarget(ok.gift, [patron(claim.winner)]));
      } else {
        add('attend');
        add('petition', pickTarget(ok.petition, side ? [patron(side)] : [patron('queen'), patron('none')]));
        if (side) add('gift', pickTarget(ok.gift, [patron(side)]));
        if (s.info < 40) add('gossip', pickTarget(ok.gossip));
        add('letter', 'christine');
        add('courtly');
      }
      if (s.money > 2500) add('chapel');
    }
  }
  // Thrift, for every policy but random: no optional spending below 800 livres.
  if (policy !== 'random' && s.money < 800) for (let i = want.length - 1; i >= 0; i--) if (['gift', 'courtly', 'chapel'].includes(want[i].id)) want.splice(i, 1);
  // Fill with something useful rather than idle (every policy's fallback).
  for (const id of ['tenants', 'accounts', 'attend', 'letter', 'rest']) if (ok[id]) add(id, pickTarget(ok[id]));
  // Drop what the purse cannot cover, from the end.
  const costOfPlan = () => want.reduce((t, w) => t + byPlace[place].actions.find((a) => a.id === w.id).cost + (w.id === 'ransom' ? Number(w.target) : 0), 0);
  while (want.length && costOfPlan() > Math.max(0, s.money)) want.pop();
  return { type: 'plan', place, actions: want };
}

/** The bot's next input for whatever phase the game is in. */
export function decide(s, policyName = 'christine') {
  const deafened = policyName.endsWith('+deaf');
  const policy = deafened ? policyName.slice(0, -5) : policyName;
  const v = view(s);
  const rng = streamFor(s.seed, s.turn * 7 + s.history.length, `bot:${policy}`);
  if (v.phase === 'scene') return { type: 'scene', choice: sceneChoice(s, v, policy, rng) };
  if (v.phase === 'card') return { type: 'card', choice: cardChoice(s, policy, rng) };
  if (v.phase === 'plan') {
    const careful = policy === 'christine' || policy === 'deaf' || policy === 'seasonal';
    if (careful && s.husband && s.counsel !== 'stay' && s.turn >= 22) return { type: 'counsel', value: 'stay' };
    if (SIDE[policy] && s.husband && s.counsel !== SIDE[policy]) return { type: 'counsel', value: SIDE[policy] };
    const p = plan(s, v, policy, rng, deafened);
    // Until he has agreed to stay out of the armies, every plan carries a letter saying so.
    if (careful && s.husband && !s.husband.stay && s.turn >= 22 && p.actions.length) {
      const alt = { ...p, actions: [...p.actions.slice(0, -1), { id: 'letter', target: 'husband' }] };
      if (!planProblem(s, alt)) return alt;
    }
    return p;
  }
  throw new Error(`bot: nothing to decide in phase ${v.phase}`);
}

export { houseView, advance };
