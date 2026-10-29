// Systemic events (design rule 6): each is built from the current state of the
// systems (her place, her people, her husband, the factions), not a script.
// At most one per half-year, never the same one twice within three half-years.
// Choices are declarative ops (effects.js) plus a few kinds the engine resolves
// in turn.js resolveCard. Every choice shows what is at stake, computed from
// the ops it will apply.

import { CAST } from '../data/cast.data.js';
import { SUITORS } from '../data/cast.data.js';
import { PLAGUE } from '../data/history.data.js';
import { keyOf, factionLabel } from './clock.js';
import { hedging, present, nameOf, protector, costOf } from './derive.js';
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
