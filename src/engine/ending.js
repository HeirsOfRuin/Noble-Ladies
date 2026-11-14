// The ending: a legacy score (derive.score) and a closing epitaph in the voice
// of a chronicle, built from the final state. Every clause reads a fact in the
// save; nothing is said that did not happen.

import { CONFIG } from '../data/config.data.js';
import { CAST } from '../data/cast.data.js';
import { WANTS } from '../data/arcs.data.js';
import { score, traitWords, wantStatus } from './derive.js';
import { words } from './effects.js';
import { lastWords } from './reflect.js';
import { yearOf, actOf, actTitle, dateLabel, FIRST_TURN, turnOfKey } from './clock.js';
import { HISTORY } from '../data/history.data.js';
import { BACKGROUNDS } from '../data/backgrounds.data.js';

const repWord = (r) => (r >= 75 ? 'a lady of great good name' : r >= 55 ? 'a lady well spoken of' : r >= 35 ? 'a lady of middling report' : 'a lady much talked about, and not kindly');

export function epitaph(s) {
  const L = s.lady;
  const out = [];
  const of = BACKGROUNDS[s.background || 'beauvaisis'].of;
  out.push(`Item, of ${L.name} of the house of ${L.house}${of ? `, ${of}` : ''}, born in the year ${CONFIG.birthYear}, married at eighteen to ${s.flags.firstHusband}.`);
  if (s.want) out.push(`She wanted ${WANTS[s.want].chronicle}${wantStatus(s).achieved ? ', and had it' : ', and did not have it'}.`);
  const a = s.flags.agincourt;
  if (a === 'killed') out.push('Her lord fell at Agincourt with the flower of France.');
  else if (a === 'captured') out.push(s.husband?.status === 'captured' ? 'Her lord was taken at Agincourt and was still a prisoner in England when the king died.' : 'Her lord was taken at Agincourt, and she bought him back.');
  else if (a === 'survived') out.push('Her lord came home from Agincourt, which few did.');
  else if (a === 'absent') out.push('Her lord was not at Agincourt, and lived because of it.');
  if (s.flags.remarried) out.push(`Widowed, she married again, to ${s.flags.secondHusband}.`);
  else if (s.widowed) out.push('She was left a widow, and governed her own affairs thereafter.');
  const born = s.children.length, living = s.children.filter((c) => c.alive);
  if (!born) out.push('She had no children who lived to be baptised.');
  else {
    out.push(`She bore ${words(born)} ${born > 1 ? 'children' : 'child'}, ${born === 1 ? (living.length ? 'who was living at the end' : 'who did not live') : `of whom ${living.length ? words(living.length) : 'none'} ${living.length === 1 ? 'was' : 'were'} living at the end`}.`);
    for (const c of living.filter((c) => c.betrothed)) out.push(`${c.name} was promised to the house of ${c.betrothed.name.replace(/^the lord of /, '')}.`);
  }
  const B = s.flags.brecourt;
  const brec = { judged: 'She won back her father\'s house of Brécourt at law, and held it.', shared: 'She made peace with her cousin over Brécourt by a marriage, so that her grandchildren would hold it.', lost: 'She held her father\'s house of Brécourt for a time, and lost it again when the Burgundians returned.', refused: 'She went to law for her father\'s house of Brécourt, and lost.', given: 'She let her father\'s house of Brécourt go to her cousin, and did not ask for it again.', seized: 'She held her father\'s house of Brécourt by a grant of the Armagnacs.' }[B];
  out.push(brec || (s.flags.caseBrecourt ? 'Her suit for her father\'s house of Brécourt was still before the Parlement when the king died.' : 'Her father\'s house of Brécourt went to her cousin, and she let it.'));
  if (s.flags.ysabelSheltered) out.push('She hid her friend Ysabel de Fontenoy from the Armagnacs at the risk of her own house.');
  else if (s.flags.ysabelFreed) out.push('She brought her friend Ysabel de Fontenoy out of the Châtelet in the year of the butchers.');
  else if (s.flags.ysabelTurnedAway || s.flags.ysabelAbandoned) out.push('Her friend Ysabel de Fontenoy, whom she did not help, did not speak of her afterwards.');
  if (s.flags.mercyJacqueline) out.push('She took in her enemy Jacqueline d\'Aubercourt and her children when they had nowhere to go, and was repaid.');
  else if (s.flags.revengeJacqueline) out.push('She shut her door on her enemy Jacqueline d\'Aubercourt, and Jacqueline did not forget it.');
  for (const c of s.children.filter((x) => x.alive)) {
    const p = { page: `${c.name} was raised a page in a great household.`, queen: `${c.name} was raised among the girls of the queen\'s household.`, poissy: `${c.name} was schooled by the sisters of Poissy.`, church: `${c.name} went to the Church.`, nun: `${c.name} took the veil at Poissy.` }[c.placement];
    if (p) out.push(p);
  }
  if (s.flags.followedQueen) out.push('She went with Queen Isabeau into exile at Tours, when few would.');
  else if (s.flags.leftQueen) out.push('When the queen was sent to Tours, she stayed at home.');
  if (s.flags.queenAnswered) out.push('At Troyes she asked the queen why, and the queen told her; she never repeated it.');
  const T = { sworn: 'She swore to the treaty of Troyes with the rest, and kept her lands.', ill: 'She was ill on the day the oath to the English king was taken, and nobody came back to ask again.', dauphin: 'In the year of Troyes she wrote to the Dauphin at Bourges, and the letter was never found.' }[s.flags.troyes];
  if (T) out.push(T);
  if (s.flags.queensLady) out.push('She was one of Queen Isabeau\'s ladies, which in those years was an honour and a danger both.');
  else if ((s.stats?.officeHalves || 0) >= 8) out.push('Her lord held a place in the king\'s household for many years, because she kept him in Paris to hold it.');
  if ((s.flags.christineBooks || 0) >= 2) out.push('She carried Christine de Pizan\'s books to the queen, more than once.');
  if ((s.flags.lettersOpened || 0) >= 2) out.push('Her letters were opened at the gates more than once, and copies kept.');
  if (s.flags.securedPaid) out.push('When Paris changed masters, her plate was with the Lombards.');
  if (s.flags.raoulSaved) out.push('She kept her husband\'s oath to his brother-in-arms, Raoul de Fléchin, when it was dangerous to keep.');
  else if (s.flags.brokeContract) out.push('She refused her husband\'s brother-in-arms at the gate, and was spoken of for it.');
  const r = s.flags.remarried ? null : (s.husband?.regard ?? s.flags.lastRegard);
  if (r !== undefined && r !== null) out.push(r >= 65 ? 'Her lord trusted her judgment, and said so.' : r <= 30 ? 'She and her lord were courteous strangers.' : '');
  const lost = s.landsStart - s.lands;
  if (s.landsStart) out.push(lost > 0 ? `Of ${s.landsStart} holdings, ${lost} were lost in the troubles.` : lost < 0 ? 'Her house held more land at the end than at the beginning.' : 'Her house kept every holding it had, through all the troubles.');
  if (s.money < 0) out.push(`She died owing ${-s.money} livres.`);
  const said = traitWords(s);
  out.push(`She was ${repWord(s.rep)}${said.length ? `, and was called ${said.join(', ').replace(/, ([^,]*)$/, ' and $1')}` : ''}.`);
  if (s.outcome === 'dead') out.push(({ childbed: `She died in childbed in the year ${yearOf(s.turn)}.`, sickness: `She died of the sickness in Paris in the year ${yearOf(s.turn)}.`, violence: `She was killed in Paris in the year ${yearOf(s.turn)}, when the Burgundians broke the prisons.` })[s.flags.death] || `She died of a fever in the year ${yearOf(s.turn)}.`);
  else if (s.outcome === 'ruined') out.push(`In the year ${yearOf(s.turn)} her creditors took the house.`);
  else if (s.flags.convent) out.push('She ended her days among the Poor Clares, and was buried in their church.');
  else out.push('She outlived the mad king, which was more than many managed.');
  return out.filter(Boolean).join(' ');
}

/**
 * How this life was made: act by act, what history did (fixed, the same in every
 * game) beside what she chose (hers alone). Knight of Adalia's turning-points page,
 * set to this game's theme: she changes her own fate, not history's.
 */
export function lifeMade(s) {
  const acts = [];
  const end = Math.min(s.turn, FIRST_TURN + 43);
  for (let a = 2; a <= 4; a++) {
    const keys = Object.keys(HISTORY).filter((k) => { const t = turnOfKey(k); return actOf(t) === a && t < end + 1 && !HISTORY[k].minor; });
    const mine = (s.story || []).filter((e) => actOf(e.turn) === a).map((e) => ({ date: dateLabel(e.turn), memo: e.memo }));
    if (!keys.length && !mine.length) continue;
    acts.push({ act: a, title: actTitle(a), history: keys.map((k) => HISTORY[k].title), mine });
  }
  return { married: s.flags.firstHusband, acts };
}

export function finish(s, outcome) {
  s.over = true;
  s.outcome = s.outcome || outcome;
  s.phase = 'over';
  s.cards = [];
  const sc = score(s);
  s.ending = { ...sc, epitaph: epitaph(s), lastWords: lastWords(s), want: wantStatus(s), made: lifeMade(s) };
  return s;
}

export { CAST };
