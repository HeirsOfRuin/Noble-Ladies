// Children as people (docs/FRAME-ROUND3.md). Each child has a temperament from
// birth, an upbringing chosen at seven, and one scene of their own between
// twelve and sixteen. A child placed in a great household is an alliance and a
// pledge: when that household's party falls, the child is at risk. No romance,
// ever: what is at stake for a child is the house, their schooling and their
// own wishes about the Church.

import { CAST } from '../data/cast.data.js';
import { childAge, present } from './derive.js';
import { factionLabel } from './clock.js';

export const TEMPERS = {
  bookish: 'bookish',
  wilful: 'wilful',
  sickly: 'sickly',
  sweet: 'sweet-natured',
  devout: 'devout',
};

const PAGE_HOUSE = {
  arm: (s) => (present(s, 'charles_o') ? 'the Duke of Orléans' : present(s, 'bernard') ? 'the Count of Armagnac' : 'the Orléans household at Blois'),
  bur: () => 'the Duke of Burgundy',
  berry: () => 'the Duke of Berry',
  queen: () => 'the queen',
};

const he = (c) => (c.sex === 'son' ? 'he' : 'she');
const his = (c) => (c.sex === 'son' ? 'his' : 'her');

/** The upbringing card, at seven. */
export function upbringingCard(s, c) {
  const choices = [];
  if (c.sex === 'son') {
    for (const f of ['arm', 'bur']) {
      const ok = s.fav[f] >= 30 || s.husband?.lean === f;
      choices.push({ label: `A page in the household of ${PAGE_HOUSE[f](s)}`, note: `He learns to serve at table, ride, carry a lance and keep his mouth shut. ${factionLabel(f, s.turn)} will count your house as theirs. If they fall, he falls with them.`,
        ops: [['fav', f, 6]], kind: 'place', child: c.id, placement: 'page', house: f, locked: !ok, why: ok ? '' : `You need friends there (${factionLabel(f, s.turn, true)} favour 30) or a husband of their party.` });
    }
    if (present(s, 'berry')) {
      const ok = s.npcs.berry.trust >= 20;
      choices.push({ label: 'A page in the household of the Duke of Berry', note: 'The king\'s uncle belongs to no party, and his household is the best-mannered in France. Safer, and less useful.', ops: [['trust', 'berry', 5]], kind: 'place', child: c.id, placement: 'page', house: 'berry', locked: !ok, why: ok ? '' : 'The Duke of Berry does not know you well enough (trust 20).' });
    }
    choices.push({ label: 'To the cathedral school at Beauvais, for the Church', note: 'Letters, Latin and a career in the Church. He will not marry, and he will not be a pledge for anyone.', ops: [['rep', 2], ['trait', 'devout', 1]], kind: 'place', child: c.id, placement: 'church' });
  } else {
    const ok = s.fav.queen >= 40;
    choices.push({ label: 'In the queen\'s household, among the girls of good family', note: 'She learns the court from the inside, and the court learns her name. The queen\'s fortunes are hers now.', ops: [['fav', 'queen', 5]], kind: 'place', child: c.id, placement: 'queen', house: 'queen', locked: !ok, why: ok ? '' : 'You need standing with the queen (favour 40).' });
    choices.push({ label: 'With the Dominican sisters at Poissy', note: 'The royal priory takes the daughters of good houses to school: letters, music, accounts. Two hundred livres for her keep. Some of them stay.', ops: [['purse', -200, 'her keep at Poissy'], ['trait', 'devout', 1]], kind: 'place', child: c.id, placement: 'poissy' });
  }
  choices.push({ label: 'Keep ' + (c.sex === 'son' ? 'him' : 'her') + ' at home', note: 'You will see to ' + his(c) + ' schooling yourself. The great houses will not know ' + (c.sex === 'son' ? 'him' : 'her') + '.', ops: [['trait', 'warm', 1]], kind: 'place', child: c.id, placement: 'home' });
  return {
    id: 'upbringing', title: `${c.name} is seven`,
    text: `${c.name} is seven, ${TEMPERS[c.temper]}, and old enough to be sent away, as children of good family are. Where ${he(c)} grows up decides who will know ${his(c) === 'his' ? 'him' : 'her'}, whom ${he(c)} can marry, and whose fortunes ${he(c)} shares.`,
    lines: [], choices,
  };
}

/** One scene of a child's own, between twelve and sixteen, from temperament and upbringing. */
export function childBeatCard(s, c) {
  const n = c.name, H = he(c), Hs = his(c);
  const house = c.house ? PAGE_HOUSE[c.house](s) : null;
  const done = { kind: 'childBeat', child: c.id };
  if (c.temper === 'sickly') return { id: 'child_beat', title: `${n}'s fever`, lines: [],
    text: `The fever ${n} had as a baby has come back, worse, with a cough that wakes the house. The physicians from Paris want forty livres to say what the village women said for nothing.`,
    choices: [
      { label: 'Pay the physicians, and do what they say', note: 'Bleeding, a diet, a room kept warm. It may help.', ops: [['purse', -120, `physicians for ${n}`]], ...done, care: 15 },
      { label: 'Take the child to Saint-Denis, to the relics', note: 'Three days on the road there and back. Half the north does it.', ops: [['purse', -60, 'the pilgrimage to Saint-Denis'], ['trait', 'devout', 1], ['health', -4]], ...done, care: 10 },
      { label: 'Sit up with the child yourself', note: 'Every night until it breaks.', ops: [['health', -8], ['trait', 'warm', 1]], ...done, care: 12 },
    ] };
  if (c.placement === 'page') return { id: 'child_beat', title: `A letter from ${n}`, lines: [],
    text: `A letter from ${n}, in a clerk's hand, from the household of ${house}. ${H[0].toUpperCase() + H.slice(1)} has served at the high table, carried the Duke's cup, been beaten twice by the master of the pages and once by a bigger boy. ${c.temper === 'wilful' ? 'He wants a horse of his own, a real one, and says the other pages laugh at the one his father sent.' : 'He asks, very carefully, whether a page may have a horse of his own, because the others have.'}`,
    choices: [
      { label: 'Send him a horse and a saddle with your arms', note: 'A hundred and twenty livres. The household will see whose son he is.', ops: [['purse', -120, `a horse for ${n}`], ...(c.house === 'berry' ? [['trust', 'berry', 4]] : [['fav', c.house, 4]]), ['regard', 3]], ...done, care: 6 },
      { label: 'Tell him a page earns his horse', note: 'He will hate it for a year and be glad of it later. Perhaps.', ops: [['trait', 'bold', 1]], ...done, care: 3 },
    ] };
  if (c.placement === 'church' || (c.temper === 'bookish' && c.sex === 'son')) return { id: 'child_beat', title: `${n} wants the University`, lines: [],
    text: `${n} has outgrown every book in the house and two of Brother Robert's. ${H[0].toUpperCase() + H.slice(1)} wants to go to Paris, to the University, to the Collège de Navarre, where the King's own clerks are made. It costs money, and the students fight in the streets for whichever duke they think is right.`,
    choices: [
      { label: 'Send him to Paris', note: 'A hundred and fifty livres a year, a room in the rue Saint-Jacques, and a clerk\'s career. He will not marry.', ops: [['purse', -150, `${n} at the University`], ['rep', 2], ['info', 6]], ...done, care: 10, placement: 'church' },
      { label: 'Keep him home another year', note: 'He will read the same books again, and resent it.', ops: [], ...done, care: -5 },
    ] };
  if (c.temper === 'devout' && c.sex === 'daughter' && c.placement !== 'nun') return { id: 'child_beat', title: `${n} asks for the veil`, lines: [],
    text: `${n} comes to you after vespers with ${c.placement === 'poissy' ? 'the prioress\'s letter already written' : 'her hands folded and her mind made up'}. She wants to take the veil at Poissy. She has thought about it, she says, for two years, and she would rather say her hours for this house than be married off to keep it.`,
    choices: [
      { label: 'Give your consent', note: 'A dowry to the priory, smaller than a husband\'s, and prayers for the house for her whole life. No match.', ops: [['purse', -300, `${n}'s dowry to Poissy`], ['rep', 4], ['trait', 'devout', 1], ['count', 'chapels', 1]], ...done, care: 10, placement: 'nun' },
      { label: 'Tell her to wait two years', note: 'She will wait. She will not forget that you made her.', ops: [], ...done, care: -10 },
    ] };
  if (c.temper === 'bookish') return { id: 'child_beat', title: `${n} and Christine`, lines: [],
    text: `${n} has found Christine de Pizan's Book of the City of Ladies in a chest and read it twice, and wants to write to her. "She says women built cities. Did they?"`,
    choices: [
      { label: 'Let her write, and send the letter with yours', note: 'Christine answers children; she says they are the only honest readers.', ops: [['trust', 'christine', 8], ['info', 4]], ...done, care: 12 },
      { label: 'Tell her the book is not for girls of thirteen', note: 'She will read it again, in secret.', ops: [['trait', 'warm', -1]], ...done, care: -4 },
    ] };
  if (c.temper === 'wilful' && c.sex === 'son') return { id: 'child_beat', title: `${n} has gone`, lines: [],
    text: `${n} is gone, with a horse from the stable and his father's old sword. A carter saw him on the road to ${s.husband?.lean === 'bur' ? 'Arras' : 'Senlis'}, where a captain is taking on boys who can ride. He is fourteen.`,
    choices: [
      { label: 'Ride after him yourself', note: 'Two days on the road, and a scene in a captain\'s camp he will never forgive.', ops: [['health', -4], ['purse', -40, 'the road after your son'], ['trait', 'bold', 1]], ...done, care: 5 },
      { label: 'Write to the captain, and pay for his keep', note: 'Let him learn. Pay the captain to keep him at the back.', ops: [['purse', -100, `${n}'s keep with the captain`]], ...done, care: -5, risk: 0.15 },
    ] };
  const other = c.house === 'arm' || s.husband?.lean === 'arm' ? 'bur' : 'arm';
  return { id: 'child_beat', title: `${n}'s friend`, lines: [],
    text: `${n}, who is ${TEMPERS[c.temper]} and makes friends the way other children catch colds, has made one of the ${other === 'bur' ? 'Burgundian' : 'Armagnac'} ${c.sex === 'son' ? 'squire\'s son' : 'captain\'s daughter'} at the next house. They are inseparable. Their parents are on opposite sides of a war.`,
    choices: [
      { label: 'Let the friendship be', note: 'Children\'s friendships become alliances, sometimes. The other side will notice.', ops: [['fav', other, 6], ['trait', 'warm', 1]], ...done, care: 6 },
      { label: 'Keep them apart', note: 'Sensible. Your child will not understand.', ops: [], ...done, care: -6 },
    ] };
}

/** When a child's household falls at a swing. */
export function pledgeCard(s, c, winner) {
  const house = PAGE_HOUSE[c.house](s);
  return {
    id: 'pledge', title: `${c.name} in the household of ${house}`, lines: [],
    text: `${c.name} is ${c.placement === 'queen' ? 'one of the girls of the household of' : 'a page in the household of'} ${house}, and ${house}'s people are being turned out of their houses by ${factionLabel(winner, s.turn)}. A child in a fallen household is nobody, unless somebody decides ${he(c)} is a hostage.`,
    choices: [
      { label: `Send for ${c.sex === 'son' ? 'him' : 'her'} at once, whatever it costs`, note: `Two men and a hundred livres to bring ${c.sex === 'son' ? 'him' : 'her'} home through a city that is looking for that household's badge.`, ops: [['purse', -100, `bringing ${c.name} home`], ['fav', c.house, -4]], kind: 'pledge', child: c.id, home: true },
      { label: `Leave ${c.sex === 'son' ? 'him' : 'her'} where ${he(c)} is`, note: 'The household will remember who stayed. If the winners hold its children, you will pay to get yours back.', kind: 'chance', p: 0.7, win: [['fav', c.house, 6]], lose: [['purse', -300, `${c.name}'s ransom from the winners`]], child: c.id },
    ],
  };
}

/** Called each half-year from familyTurn: upbringing at seven, a scene at twelve to sixteen. */
export function childrenTurn(s, rng) {
  for (const c of s.children) {
    if (!c.alive) continue;
    const age = childAge(s, c);
    if (age >= 7 && !c.placement && !s.cards.some((x) => x.id === 'upbringing')) { s.cards.push(upbringingCard(s, c)); break; }
  }
  for (const c of s.children) {
    if (!c.alive || c.beatDone) continue;
    const age = childAge(s, c);
    if (age >= 12 && age <= 16 && rng.chance(0.35) && !s.cards.some((x) => x.id === 'child_beat')) { c.beatDone = true; s.cards.push(childBeatCard(s, c)); break; }
  }
}

export { CAST };
