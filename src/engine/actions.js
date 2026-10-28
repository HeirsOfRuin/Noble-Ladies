// Resolving the player's actions. Design rule 1, indirect power: almost every
// action goes through someone, and that person's reliability (rel) and
// loyalty decide whether it happens as asked, late, badly, or against her.
// Results that take time are queued and come due in a later half-year.

import { ACTIONS } from '../data/actions.data.js';
import { CAST } from '../data/cast.data.js';
import { CONFIG } from '../data/config.data.js';
import { coin } from './ledger.js';
import { clamp, gainRep } from './effects.js';
import { costOf, giftGain, lawsuitChance, petitionChance, childAge, nameOf } from './derive.js';
import { makeNpc } from './state.js';
import { addNews } from './news.js';
import { matchOffers } from './family.js';

const REPLACEMENTS = {
  steward: ['Colin Ravier', 'Thibaut Hennequin', 'Gilet Poulain', 'Jacquet Morel'],
  maid: ['Jehannette', 'Marion', 'Guillemette', 'Alison'],
};

const bump = (s, k, n) => { if (k === 'rep') gainRep(s, n); else s[k] = clamp(s[k] + n); };
const fav = (s, f, n) => { if (f && f !== 'none') s.fav[f] = clamp(s.fav[f] + n); };

/** Resolve one chosen action. Pushes plain-language lines describing what happened. */
export function resolveAction(s, act, rng, lines, ctx) {
  const a = ACTIONS[act.id];
  const cost = costOf(s, a.cost);
  if (cost) coin(s, -cost, a.label.toLowerCase());
  const t = act.target;

  switch (act.id) {
    case 'attend': {
      const g = Math.round(a.favour * (1 - s.fav.queen / 160));
      fav(s, 'queen', g); s.npcs.queen.use = clamp(s.npcs.queen.use + a.use); bump(s, 'info', a.info);
      lines.push(`You waited on the queen. Her household favour +${g}.`);
      break;
    }
    case 'petition': {
      const p = petitionChance(s, t);
      s.queue.push({ due: s.turn + 1, kind: 'petition', npc: t, p });
      lines.push(`Your petition went to ${CAST[t].short}'s household. An answer may come next half-year.`);
      break;
    }
    case 'gift': {
      const n = s.npcs[t], maid = s.npcs.maid;
      let g = giftGain(s, t);
      maid.seen += 1;
      if (rng.chance((1 - maid.rel) * 0.4)) { g /= 2; lines.push(`${nameOf(s, 'maid')} delivered the gift late and badly.`); }
      n.trust = clamp(n.trust + Math.round(a.trust * g)); n.use = clamp(n.use + Math.round(a.use * g));
      fav(s, n.faction, Math.round(a.favour * g));
      n.gifts.push(s.turn);
      lines.push(`A gift to ${CAST[t].name}: trust +${Math.round(a.trust * g)}.`);
      break;
    }
    case 'gossip': {
      const src = s.npcs[t];
      src.seen += 1;
      const gain = Math.round(a.info * (0.5 + src.rel / 2));
      bump(s, 'info', gain);
      for (let i = 0; i < a.rumours; i++) addNews(s, rng, { quality: 0.3 + 0.6 * src.rel, src: t, horizon: 3 });
      lines.push(`${nameOf(s, t)} listened for you. Information +${gain}.`);
      if (rng.chance((1 - src.loyalty) * 0.25)) { bump(s, 'rep', -3); lines.push(`${nameOf(s, t)} talked about your questions as well. Reputation -3.`); }
      break;
    }
    case 'rumour': {
      s.queue.push({ due: s.turn + 1, kind: 'rumour', traced: (1 - s.npcs.maid.loyalty) * 0.6 + 0.1 });
      s.npcs.maid.seen += 1;
      lines.push(`${nameOf(s, 'maid')} has a story to tell in the right kitchens.`);
      break;
    }
    case 'courtly': {
      fav(s, 'queen', a.favour); fav(s, 'arm', a.favour); fav(s, 'bur', a.favour); bump(s, 'info', a.info);
      const good = rng.chance(0.7);
      bump(s, 'rep', good ? a.rep : -2);
      lines.push(good ? 'A ballade was written in your honour, a decent one.' : 'A ballade was written about you. People laughed in the wrong places. Reputation -2.');
      break;
    }
    case 'accounts': {
      ctx.accounts = true;
      s.npcs.steward.seen += 2;
      lines.push(`You went through the rolls with ${nameOf(s, 'steward')}.`);
      break;
    }
    case 'repair': bump(s, 'hh', a.household); s.guard = a.guardTurns; lines.push(`The house is repaired and watched. Household +${a.household}.`); break;
    case 'tenants': bump(s, 'rep', a.rep); bump(s, 'hh', a.household); bump(s, 'info', a.info); lines.push('You sat in judgment in the hall. People will speak of it.'); break;
    case 'rest': bump(s, 'health', a.health); lines.push(`You rested. Health +${a.health}.`); break;
    case 'children': {
      for (const c of s.children) if (c.alive) c.care = clamp(c.care + a.upbringing);
      ctx.care = true;
      lines.push('You saw to the children: their health, their letters, their manners.');
      break;
    }
    case 'letter': s.queue.push({ due: s.turn + 1, kind: 'letter', to: t }); lines.push(`A letter to ${t === 'husband' ? s.husband.short : CAST[t].name} is on the road.`); break;
    case 'chapel': {
      bump(s, 'rep', a.rep);
      s.queue.push({ due: s.turn + a.delay, kind: 'chapel' });
      lines.push('The chapel is endowed. Masses will be said for your dead, and the county will notice.');
      break;
    }
    case 'lawsuit': {
      const law = s.npcs.lawyer;
      law.seen += 1;
      s.cause.progress += law.rel >= 0.8 ? 2 : 1;
      if (s.cause.progress >= a.stepsToJudgment) {
        const won = rng.chance(lawsuitChance(s));
        if (won) {
          s.lands += s.cause.holdings;
          lines.push(`Judgment in the Parlement: you win. ${s.cause.holdings} holding${s.cause.holdings > 1 ? 's' : ''} restored.`);
          gainRep(s, 3);
        } else lines.push('Judgment in the Parlement: you lose. There is no appeal worth making.');
        s.cause = null;
      } else lines.push(`Your procureur argued the case. ${s.cause.progress} of ${a.stepsToJudgment} hearings.`);
      break;
    }
    case 'servant': {
      const old = nameOf(s, t);
      const n = makeNpc(t, rng);
      n.name = rng.pick(REPLACEMENTS[t].filter((x) => x !== s.npcs[t].name));
      n.trust = 40; n.seen = 0;
      s.npcs[t] = n;
      lines.push(`${old} is dismissed. ${n.name} takes the place.`);
      break;
    }
    case 'betroth': {
      const c = s.children.find((x) => x.id === Number(t));
      c.asked = s.turn;
      s.cards.push(matchOffers(s, c, rng));
      lines.push(`Your mother writes to the houses that might take ${c.name}.`);
      break;
    }
    case 'ransom': {
      const n = Number(t);
      coin(s, -n, 'ransom');
      s.husband.ransom.paid += n;
      if (s.husband.ransom.paid >= s.husband.ransom.total) {
        s.husband.status = 'present';
        s.husband.ransom = null;
        lines.push(`The ransom is paid. ${s.husband.short} comes home, thinner and older.`);
      } else lines.push(`${n} livres go to England. ${s.husband.ransom.total - s.husband.ransom.paid} still owed.`);
      break;
    }
    default: throw new Error(`unhandled action ${act.id}`);
  }
}

/** Delayed results that come due this half-year. */
export function resolveDue(s, q, rng, lines) {
  if (q.kind === 'petition') {
    const n = s.npcs[q.npc];
    if (!n.alive) { lines.push(`Your petition to ${CAST[q.npc].short} was never answered.`); return; }
    n.seen += 1;
    if (!q.delayed && rng.chance((1 - n.rel) * 0.5)) { s.queue.push({ ...q, due: s.turn + 1, delayed: true }); lines.push(`${CAST[q.npc].short[0].toUpperCase() + CAST[q.npc].short.slice(1)}'s household has not answered your petition yet.`); return; }
    if (rng.chance(q.p)) {
      const amount = ACTIONS.petition.pension[n.faction];
      s.pensions.push({ from: q.npc, faction: n.faction, amount });
      n.use = clamp(n.use + 5);
      lines.push(`Your petition is granted: a pension of ${amount} livres a half-year from ${CAST[q.npc].short}.`);
    } else {
      fav(s, n.faction, ACTIONS.petition.failFavour);
      lines.push(`Your petition to ${CAST[q.npc].short} was refused.`);
    }
  } else if (q.kind === 'rumour') {
    const r = s.npcs.rival;
    if (!r.alive) return;
    r.use = clamp(r.use + ACTIONS.rumour.rivalUse);
    if (rng.chance(q.traced)) {
      bump(s, 'rep', ACTIONS.rumour.tracedRep); fav(s, r.faction, ACTIONS.rumour.tracedFavour); r.trust = clamp(r.trust - 20);
      lines.push(`The story about Jacqueline d'Aubercourt went round, and it was traced to your household. Reputation ${ACTIONS.rumour.tracedRep}.`);
    } else lines.push('The story about Jacqueline d\'Aubercourt went round the court. Nobody knows where it started.');
  } else if (q.kind === 'letter') {
    if (q.to === 'husband') {
      const h = s.husband;
      if (!h || h.status === 'dead') return;
      if (rng.chance(h.heed / 100)) {
        if (s.counsel === 'arm' || s.counsel === 'bur') h.lean = s.counsel;
        if (s.counsel === 'stay') h.stay = true;
        lines.push(s.counsel === 'none' ? `${h.short} writes back warmly.` : `${h.short} takes your counsel.`);
      } else lines.push(`${h.short} reads your letter and does as he pleases.`);
      h.heed = clamp(h.heed + 3);
      return;
    }
    const n = s.npcs[q.to];
    if (!n.alive) return;
    n.trust = clamp(n.trust + ACTIONS.letter.trust); n.use = clamp(n.use + ACTIONS.letter.use);
    if (['christine', 'friend', 'mother'].includes(q.to)) {
      bump(s, 'info', ACTIONS.letter.info);
      addNews(s, rng, { quality: q.to === 'christine' ? 0.85 : q.to === 'friend' ? 0.4 + 0.5 * n.rel : 0.5, src: q.to, horizon: 3 });
    }
    lines.push(`${CAST[q.to].name} has answered your letter.`);
  } else if (q.kind === 'chapel') {
    bump(s, 'rep', ACTIONS.chapel.repLater); s.npcs.confessor.trust = clamp(s.npcs.confessor.trust + ACTIONS.chapel.confessorTrust);
    lines.push(`The first masses are said in your chapel. Reputation +${ACTIONS.chapel.repLater}.`);
  }
}

export { childAge, CONFIG };
