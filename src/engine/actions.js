// Resolving the player's actions. Design rule 1, indirect power: almost every
// action goes through someone, and that person's reliability (rel) and
// loyalty decide whether it happens as asked, late, badly, or against her.
// Results that take time are queued and come due in a later half-year.

import { ACTIONS } from '../data/actions.data.js';
import { CAST } from '../data/cast.data.js';
import { CONFIG } from '../data/config.data.js';
import { controlAt } from './clock.js';
import { coin } from './ledger.js';
import { clamp, gainRep, applyOps } from './effects.js';
import { letterOpenChance, letterSide, costOf, giftGain, lawsuitChance, petitionChance, childAge, nameOf, brecourtChance, BRECOURT_JUDGMENT } from './derive.js';
import { makeNpc } from './state.js';
import { addNews } from './news.js';
import { addDebt, callInCard } from './favours.js';
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
    case 'letter': {
      const [to, how] = String(t).split('|');
      const name = to === 'husband' ? s.husband.short : CAST[to].name;
      if (how === 'robert') {
        s.npcs.confessor.seen += 1;
        s.queue.push({ due: s.turn + 2, kind: 'letter', to });
        lines.push(`Brother Robert takes your letter to ${name} in his satchel, with his breviary. It will be slow.`);
      } else {
        s.queue.push({ due: s.turn + 1, kind: 'letter', to });
        lines.push(`Your man rides with a letter to ${name}.`);
        if (rng.chance(letterOpenChance(s, to))) {
          const f = letterSide(s, to), c = controlAt(s.turn);
          s.flags.exposedTo = { ...(s.flags.exposedTo || {}) };
          if (f === 'arm' || f === 'bur') s.flags.exposedTo[f] = Math.min(0.4, (s.flags.exposedTo[f] || 0) + 0.15);
          if (c === 'arm' || c === 'bur') s.fav[c] = clamp(s.fav[c] - 5);
          s.flags.lettersOpened = (s.flags.lettersOpened || 0) + 1;
          lines.push(`Your letter to ${name} was opened at a gate and sealed again, badly. Someone has a copy. It will count against you when Paris next changes hands.`);
        }
      }
      break;
    }
    case 'intercept': {
      s.npcs.maid.seen += 1;
      s.queue.push({ due: s.turn + 1, kind: 'intercept', who: t, p: 0.3 + s.npcs.maid.rel * 0.6, caught: (1 - s.npcs.maid.loyalty) * 0.4 });
      lines.push(`${nameOf(s, 'maid')} has a cousin who carries letters for ${CAST[t].short}'s household.`);
      break;
    }
    case 'chapel': {
      bump(s, 'rep', a.rep);
      s.flags.chapels = (s.flags.chapels || 0) + 1;
      s.queue.push({ due: s.turn + a.delay, kind: 'chapel' });
      lines.push('The chapel is endowed. Masses will be said for your dead, and the county will notice.');
      break;
    }
    case 'lawsuit': {
      const law = s.npcs.lawyer;
      law.seen += 1;
      if (t === 'brecourt') {
        s.flags.brecourtHearings = (s.flags.brecourtHearings || 0) + (law.rel >= 0.8 ? 2 : 1);
        if (s.flags.brecourtHearings >= BRECOURT_JUDGMENT) {
          const won = rng.chance(brecourtChance(s));
          if (won) { s.flags.brecourt = 'judged'; s.lands += 3; gainRep(s, 3); lines.push('Judgment in the Parlement: Brécourt is yours. Gérard has a month to leave your father\'s house.'); }
          else { s.flags.brecourt = 'refused'; lines.push('Judgment in the Parlement: the court upholds Gérard. Master Lorfèvre says there is no appeal worth making, and does not meet your eye.'); }
        } else lines.push(`Master Lorfèvre argued Brécourt before the Parlement. ${s.flags.brecourtHearings} of ${BRECOURT_JUDGMENT} hearings.`);
        break;
      }
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
    case 'distance': {
      const f = t;
      s.fav[f] = clamp(s.fav[f] + a.favour);
      if (s.colours === f) s.colours = 'none';
      if (s.flags.exposedTo?.[f]) { s.flags.exposedTo = { ...s.flags.exposedTo, [f]: 0 }; }
      gainRep(s, -1);
      lines.push(`You burned their letters in the kitchen fire and stopped going to their masses. ${f === 'queen' ? 'The queen\'s ladies' : 'Their people'} noticed within the week. Favour ${a.favour}.`);
      break;
    }
    case 'callin': {
      const d = s.debts.find((x) => x.id === Number(t));
      s.cards.push(callInCard(s, d));
      lines.push(`You go in person to ${CAST[d.who].short}.`);
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
      lines.push(`Your petition is granted: a pension of ${amount} livres a half-year from ${CAST[q.npc].short}. A pension is also a debt: one day they will ask for something.`);
      addDebt(s, q.npc, 'out', 1, 'the pension granted to you');
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
    // Correspondents are the best road for news: better than talk at court.
    bump(s, 'info', ACTIONS.letter.info);
    addNews(s, rng, { quality: q.to === 'christine' ? 0.9 : q.to === 'friend' ? 0.45 + 0.5 * n.rel : CAST[q.to].role === 'patron' ? 0.65 : 0.55, src: q.to, horizon: 3 });
    lines.push(`${CAST[q.to].name} has answered your letter.`);
  } else if (q.kind === 'intercept') {
    const n = s.npcs[q.who];
    if (!n?.alive) return;
    if (rng.chance(q.caught)) {
      gainRep(s, -8); n.trust = clamp(n.trust - 30); if (n.faction !== 'none') fav(s, n.faction, -8);
      lines.push(`The cousin was caught with ${CAST[q.who].short}'s letters open on a kitchen table, and said whose woman sent him. Reputation -8.`);
      return;
    }
    if (rng.chance(q.p)) {
      applyOps(s, [['hold', q.who, `what you read in ${CAST[q.who].short}'s letters`], ['info', 8]]);
      if (n.faction === 'arm' || n.faction === 'bur') addNews(s, rng, { quality: 0.9, src: 'maid', horizon: 3 });
      lines.push(`You have read ${CAST[q.who].short}'s letters, and copied what mattered. You now hold something over ${CAST[q.who].short}.`);
    } else lines.push(`${nameOf(s, 'maid')}'s cousin brought nothing back but a story about a dog.`);
  } else if (q.kind === 'loan') {
    coin(s, -q.amount, 'repaying the Lombards');
    lines.push(`The Lombard banker's man comes for ${q.amount} livres, on the day, with a notary.`);
  } else if (q.kind === 'churching') {
    coin(s, -20, 'candles and a veil for your churching');
    gainRep(s, 1);
    lines.push('Forty days after the birth you were churched at the parish church, in a new veil, and the women of the household walked behind you with candles.');
  } else if (q.kind === 'chapel') {
    bump(s, 'rep', ACTIONS.chapel.repLater); s.npcs.confessor.trust = clamp(s.npcs.confessor.trust + ACTIONS.chapel.confessorTrust);
    lines.push(`The first masses are said in your chapel. Reputation +${ACTIONS.chapel.repLater}.`);
  }
}

export { childAge, CONFIG };
