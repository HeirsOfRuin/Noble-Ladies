// Systemic events (design rule 6): each is built from the current state of the
// systems (her place, her people, her husband, the factions), not a script.
// At most one per half-year, never the same one twice within three half-years.
// Choices are declarative ops (effects.js) plus a few kinds the engine resolves
// in turn.js resolveCard. Every choice shows what is at stake, computed from
// the ops it will apply.

import { CAST } from '../data/cast.data.js';
import { SUITORS } from '../data/cast.data.js';
import { PLAGUE } from '../data/history.data.js';
import { keyOf, factionLabel, controlAt } from './clock.js';
import { hedging, present, nameOf, protector, costOf } from './derive.js';
import { debtsOut } from './favours.js';
import { WAR } from './family.js';
import { lateCard } from './act1.js';

const E = {
  rival_talk: {
    weight: (s, place) => place === 'court' && present(s, 'rival') && s.npcs.rival.use >= 20 && s.npcs.rival.trust < 35 ? 0.4 + s.npcs.rival.use / 100 : 0,
    card: (s) => ({
      title: 'Talk at court', text: `Jacqueline d'Aubercourt has been amusing the queen's ladies with stories about your household: your husband's debts, your country manners, the state of your best gown.`,
      choices: [
        present(s, 'friend') && s.npcs.friend.trust >= 35
          ? { label: 'Have Ysabel answer her for you', kind: 'chance', p: s.npcs.friend.rel, win: [['rep', 2], ['trust', 'friend', -4]], lose: [['rep', -3], ['trust', 'friend', -4]], via: 'friend' }
          : { label: 'Answer her yourself, sharply', kind: 'chance', p: 0.4, win: [['rep', 1], ['use', 'rival', -8]], lose: [['rep', -5]] },
        { label: 'Let it pass', ops: [['rep', -4]] },
        { label: 'Be seen at confession and at the poor table', ops: [['purse', -costOf(s, 120), 'alms'], ['rep', 1]] },
      ],
    }),
  },
  steward_short: {
    weight: (s) => (s.flags.lastSkim > 0 ? 0.5 : 0),
    card: (s) => ({
      title: 'The rents are short', text: `The rolls from your lands are short again: ${s.flags.lastSkim} livres this half-year that ${nameOf(s, 'steward')} says the tenants could not pay. Some of them, perhaps, could not.`,
      choices: [
        { label: `Dismiss ${nameOf(s, 'steward')}`, kind: 'replace', who: 'steward', ops: [] },
        { label: 'Keep him, but let him know you are counting', ops: [['trust', 'steward', -10]], kind: 'warn_steward' },
        { label: 'Let it go', ops: [['trust', 'steward', 5]] },
      ],
    }),
  },
  ally_asks: {
    // Ysabel's requests live in her own story (arcs.data.js), not here.
    weight: (s) => (['mother', 'christine'].some((id) => present(s, id) && s.npcs[id].trust >= 45) ? 0.35 : 0),
    card: (s, rng) => {
      const who = rng.pick(['mother', 'christine'].filter((id) => present(s, id) && s.npcs[id].trust >= 45));
      if (who === 'christine') return { title: 'Christine asks a favour', text: 'Christine de Pizan has finished a new book, a treatise for the instruction of ladies. She asks you to put a copy into the queen\'s hands.',
        choices: [{ label: 'Do it', ops: [['fav', 'queen', -2], ['trust', 'christine', 15], ['info', 5]] }, { label: 'Make your excuses', ops: [['trust', 'christine', -6]] }] };
      return { title: 'Your mother writes', text: 'Your mother asks for 300 livres toward your younger sister\'s dowry. She has asked nobody else, she says, which you believe.',
        choices: [{ label: 'Send it', ops: [['purse', -300, 'your sister\'s dowry'], ['trust', 'mother', 10], ['rep', 2]] }, { label: 'Refuse', ops: [['trust', 'mother', -12]] }] };
    },
  },
  husband_debts: {
    weight: (s) => (s.husband?.status === 'present' && s.husband.spending >= 4 ? 0.25 * (s.husband.spending - 3) : 0),
    card: (s) => ({
      title: 'His creditors', text: `A goldsmith and a horse-dealer are at the gate with ${s.husband.short}'s notes. He is out hunting.`,
      choices: [
        { label: 'Pay them from the household purse', ops: [['purse', -costOf(s, 300), 'your husband\'s debts']] },
        { label: 'Send them away; it is his affair', ops: [['rep', -4], ['hh', -4]] },
        { label: 'Pay them in plate from the dresser', ops: [['hh', -10]] },
      ],
    }),
  },
  tenant_trouble: {
    weight: (s, place) => (place === 'court' ? 0.25 : 0),
    card: (s) => ({
      title: 'Trouble on the lands', text: `Two of your villages are at law with each other over a mill-race, and ${nameOf(s, 'steward')} writes that they will not accept his judgment.`,
      choices: [
        { label: 'Let the steward settle it', kind: 'chance', p: s.npcs.steward.rel, win: [['rep', 1]], lose: [['rep', -3], ['hh', -5]], via: 'steward' },
        { label: 'Ride home and judge it yourself', ops: [['health', -3], ['fav', 'queen', -3], ['rep', 3], ['hh', 3]] },
      ],
    }),
  },
  sickness: {
    weight: (s, place) => 0.1 + (PLAGUE[keyOf(s.turn)] || 0) * 0.5 + (place === 'court' ? 0.05 : 0),
    card: (s) => ({
      title: 'A fever', text: 'You wake with a fever that does not break. The household is frightened, which does not help.',
      choices: [
        { label: 'Send for the physicians', ops: [['purse', -costOf(s, 150), 'physicians'], ['health', -8, 'grave']] },
        { label: 'Pray, and let it run its course', ops: [['health', -18, 'grave'], ['trust', 'confessor', 3]] },
        { label: 'Have yourself carried home to the country', ops: [['purse', -costOf(s, 60), 'the journey home'], ['health', -10, 'grave'], ['info', -10]] },
      ],
    }),
  },
  hedge_exposed: {
    weight: (s) => (hedging(s) ? 0.3 + (1 - s.npcs.maid.loyalty) * 0.6 : 0),
    card: (s) => ({
      title: 'Both sides', text: `A letter of yours to a ${factionLabel('bur', s.turn)} lady has been shown to people of ${factionLabel('arm', s.turn)}, and they are asking whose friend you are.`,
      choices: [
        { label: 'Deny it, with Brother Robert to vouch for you', ops: [['rep', -2], ['trust', 'confessor', -5]] },
        { label: `Declare for ${factionLabel('arm', s.turn, true)}`, ops: [['fav', 'bur', -20], ['fav', 'arm', 4]] },
        { label: `Declare for ${factionLabel('bur', s.turn, true)}`, ops: [['fav', 'arm', -20], ['fav', 'bur', 4]] },
        { label: 'Pay the right people to forget it', ops: [['purse', -costOf(s, 250), 'silence']] },
      ],
    }),
  },
  queen_service: {
    weight: (s, place) => (place === 'court' && present(s, 'queen') && s.fav.queen >= 45 ? 0.3 : 0),
    card: (s) => ({
      title: 'The queen\'s summons', text: 'The queen goes to her house at Vincennes for the summer and asks you to come, at your own cost, with your own women and your own horses.',
      choices: [
        { label: 'Go', ops: [['purse', -costOf(s, 150), 'the queen\'s summer'], ['fav', 'queen', 8], ['use', 'queen', 6], ['health', -4]] },
        { label: 'Plead your health', ops: [['fav', 'queen', -5]] },
      ],
    }),
  },
  husband_war: {
    weight: (s) => (s.husband?.status === 'present' && WAR.has(keyOf(s.turn + 1)) && s.husband.lean !== 'none' && !s.husband.stay ? 0.35 : 0),
    card: (s) => ({
      title: 'He wants to ride', text: `${s.husband.short} has been asked to bring his men to ${factionLabel(s.husband.lean, s.turn)}. He has made up his mind, he says. He asks what you think anyway.`,
      choices: [
        { label: 'Tell him to go with your blessing', ops: [['fav', s.husband.lean, 6]] },
        { label: 'Ask him to stay out of it', kind: 'stay', p: s.husband.heed / 100, ops: [] },
      ],
    }),
  },
  debt_called: {
    // Someone she owes asks for it back, usually at a bad moment (favours.js).
    weight: (s) => (debtsOut(s).some((d) => s.turn - d.turn >= 2) ? 0.45 : 0),
    card: (s, rng) => {
      const d = rng.pick(debtsOut(s).filter((x) => s.turn - x.turn >= 2));
      const n = s.npcs[d.who], c = CAST[d.who];
      const other = n.faction === 'arm' ? 'bur' : n.faction === 'bur' ? 'arm' : null;
      const word = other
        ? { label: `Speak for their man, openly`, note: `Everyone in ${factionLabel(other, s.turn)} will hear you did.`, ops: [['fav', other, -6 * d.w], ['fav', n.faction, 3], ['trust', d.who, 10], ['clearDebt', d.id]] }
        : { label: 'Lend your name to their request at court', note: 'The queen\'s people will notice whose errands you run.', ops: [['fav', 'queen', -4 * d.w], ['trust', d.who, 10], ['clearDebt', d.id]] };
      return {
        title: `${c.short[0].toUpperCase()}${c.short.slice(1)} calls in a debt`,
        text: `${nameOf(s, d.who)} has not forgotten ${d.why}. A letter comes, polite and specific: a word for one of their people before the council, or, failing that, ${120 * d.w} livres, which is what such a word is worth.`,
        choices: [
          word,
          { label: `Pay ${120 * d.w} livres instead`, note: 'Money settles it, and buys nothing more.', ops: [['purse', -120 * d.w, `what you owed ${c.short}`], ['clearDebt', d.id]] },
          { label: 'Refuse', note: 'A lady who does not pay what she owes is talked about.', ops: [['trust', d.who, -25], ['rep', -4], ['clearDebt', d.id]] },
        ],
      };
    },
  },
  etrennes: {
    // New Year's gifts at court (étrennes): what you give, and to whom, is read by everyone.
    weight: (s, place) => (place === 'court' && keyOf(s.turn).endsWith('b') ? 0.55 : 0),
    card: (s) => {
      const to = Object.keys(GIFTS).filter((p) => present(s, p));
      return {
        title: 'New Year\'s gifts', text: 'On the first day of January the court gives gifts, and everyone notes who gave what to whom. The queen\'s ladies compare. The princes keep lists. Your husband says a lady of your rank is expected to give something, and something that will be talked about.',
        choices: [
          ...to.slice(0, 3).map((p) => ({ label: `To ${CAST[p].name}: ${GIFTS[p].what.split(',')[0]}`, note: `${costOf(s, GIFTS[p].cost)} livres. A gift received is a debt, however small.`, ops: [['purse', -costOf(s, GIFTS[p].cost), `New Year's gift for ${CAST[p].short}`], ['trust', p, 8], ['use', p, 5], ...(GIFTS[p].fav ? [['fav', GIFTS[p].fav, 5]] : [['rep', 2]]), ['owe', p, 1, 'your New Year\'s gift']] })),
          { label: 'To your husband only: a hawk', note: '60 livres. The court will notice you gave nothing to anyone who matters.', ops: [['purse', -costOf(s, 60), 'a hawk for your husband'], ['regard', 6], ['fav', 'queen', -3]] },
        ],
      };
    },
  },
  christine_letter: {
    weight: (s) => (present(s, 'christine') && s.npcs.christine.trust >= 35 ? 0.15 : 0),
    card: () => ({
      title: 'A letter from Christine', text: 'Christine de Pizan writes, as she sometimes does, with news and advice. A lady, she says, should keep her household in order and her purse closed, cultivate the queen without belonging to anyone, and never be the last to leave a city that is about to fall.',
      choices: [{ label: 'Keep the letter', kind: 'christine', ops: [['trust', 'christine', 3]] }],
    }),
  },
};

/** Cards queued by an earlier choice, called by id. */
const QUEUED = {
  remarriage: (s, rng) => {
    if (s.husband || s.flags.convent) return null;
    const w = rng.pick(SUITORS.filter((x) => x.id !== s.act1.suitors[s.act1.pick].id));
    return {
      id: 'remarriage', title: 'An offer', text: `${w.name}, a widower now, asks for your hand through your brother-in-law. He would take your dower lands under his management and your children under his roof. Your family thinks you would be foolish to refuse.`,
      choices: [
        { label: 'Accept', kind: 'remarry', suitor: w.id, ops: [['rep', 2]] },
        { label: 'Refuse', ops: [['rep', -2], ['later', keyOf(s.turn + 4), 'remarriage']] },
        { label: 'Refuse, and say you mean to end your days among the Poor Clares', ops: [['flag', 'convent', true], ['rep', 3]] },
      ],
    };
  },
  dower_contest: (s) => ({
    id: 'dower_contest', title: 'His brother claims the dower', text: 'Your late husband\'s brother says your dower was never properly assigned, and claims two of the holdings you hold as dower. He has a lawyer, and friends in the Parlement.',
    choices: [
      { label: 'Fight it in the Parlement', kind: 'cause', holdings: 2, ops: [] },
      { label: 'Settle: give him one holding', kind: 'settle', holdings: 1, ops: [['rep', 1]] },
      protector(s) || s.fav.queen >= 50
        ? { label: protector(s) ? 'Ask the Duke of Berry to speak to him' : 'Ask the queen to speak to him', kind: 'chance', p: 0.6, win: [['rep', 2]], lose: [], loseKind: 'settle', holdings: 2 }
        : { label: 'Do nothing and hope he tires of it', kind: 'chance', p: 0.3, win: [], lose: [], loseKind: 'settle', holdings: 2 },
    ],
  }),
};

export function queuedCard(s, id, rng) {
  if (QUEUED[id]) return QUEUED[id](s, rng);
  return lateCard(id);
}

/** Pick at most one systemic event for this half-year. */
const GARRISONS = ['Creil', 'Clermont', 'Compiègne', 'Senlis', 'Pontoise', 'Beaumont-sur-Oise'];
const CAPTAINS = ['a Gascon called Arnaud de Lartigue', 'a Breton who calls himself the Bastard of Plouër', 'a Picard squire called Colart Hennequin', 'a Lombard crossbowman named Boniface'];

/**
 * Protection money (appatis). In the war years the captain of the nearest
 * garrison, of whichever party, sells the villages around him their safety.
 * Pay, refuse and risk the raid, or buy a safe-conduct through a patron.
 */
export function appatisCard(s, rng, gross, w) {
  const garrison = rng.pick(GARRISONS), captain = rng.pick(CAPTAINS);
  const price = costOf(s, 40 + s.lands * 6);
  const loss = Math.round(gross * 0.45);
  const ruling = controlAt(s.turn);
  const patron = ['margaret', 'bernard', 'charles_o', 'berry', 'queen'].find((p) => present(s, p) && (s.npcs[p].faction === ruling || s.npcs[p].faction === 'none' || p === 'queen') && s.npcs[p].trust >= 20);
  const burn = [['purse', -loss, 'barns burned by soldiers'], ['hh', -10]];
  return {
    id: 'appatis', title: 'A captain sends word',
    text: `${captain[0].toUpperCase()}${captain.slice(1)}, who holds the castle at ${garrison} for whoever paid him last, sends a man to your steward with a list of your villages and a price: ${price} livres, and he will see that no harm comes to them until the vintage. The man waits in the kitchen and eats like a soldier.`,
    lines: [],
    choices: [
      { label: `Pay the ${price} livres`, note: 'Every lady in the Beauvaisis pays someone. It is cheaper than barns.', ops: [['purse', -price, `appatis to the captain at ${garrison}`], ['guard', 2]] },
      { label: 'Refuse, and set a watch on the villages', note: 'He may not bother. He may make an example of you.', kind: 'chance', p: 1 - w.raid, win: [['trait', 'bold', 1]], lose: w.lose ? [...burn, ['lands', -1], ['trait', 'bold', 1]] : [...burn, ['trait', 'bold', 1]] },
      patron
        ? { label: `Ask ${CAST[patron].short} for a safe-conduct`, note: 'A sealed letter the captain cannot ignore. It will be a debt.', ops: [['guard', 4], ['oweTo', patron, 1, `a safe-conduct for your villages from ${garrison}`]] }
        : { label: 'Ask for a safe-conduct', note: 'You need a patron the captain fears, and someone who trusts you enough to write it.', locked: true, why: 'No patron of the ruling party knows you well enough (trust 20).', ops: [] },
    ],
  };
}

const GIFTS = {
  queen: { what: 'a little book of hours from a workshop in the rue Neuve-Notre-Dame, with your arms on the clasp', cost: 220, fav: 'queen' },
  berry: { what: 'a cameo set in gold, which the Duke will add to his collection without comment', cost: 260, fav: null },
  margaret: { what: 'a pair of white greyhounds with collars of your colours', cost: 160, fav: 'bur' },
  charles_o: { what: 'a book of ballades, newly copied', cost: 140, fav: 'arm' },
  valentina: { what: 'a reliquary pendant from a Paris goldsmith', cost: 200, fav: 'arm' },
};

export function eventsTurn(s, rng, place, beats = 0) {
  // When her own story has a beat this half-year, the systemic events give way.
  if (!rng.chance(beats ? 0.3 : 0.75)) return;
  s.flags.evLast = s.flags.evLast || {};
  const pool = Object.entries(E).map(([id, e]) => ({ id, weight: (s.turn - (s.flags.evLast[id] ?? -9)) >= 3 ? e.weight(s, place) : 0 }));
  const pick = rng.weighted(pool);
  if (!pick) return;
  s.flags.evLast[pick.id] = s.turn;
  s.cards.push({ id: pick.id, ...E[pick.id].card(s, rng) });
}

export const EVENT_IDS = Object.keys(E);
export { CAST };
