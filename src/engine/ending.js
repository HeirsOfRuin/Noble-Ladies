// The ending: a legacy score (derive.score) and a closing epitaph in the voice
// of a chronicle, built from the final state. Every clause reads a fact in the
// save; nothing is said that did not happen.

import { CONFIG } from '../data/config.data.js';
import { CAST } from '../data/cast.data.js';
import { score } from './derive.js';
import { yearOf } from './clock.js';

const repWord = (r) => (r >= 75 ? 'a lady of great good name' : r >= 55 ? 'a lady well spoken of' : r >= 35 ? 'a lady of middling report' : 'a lady much talked about, and not kindly');

export function epitaph(s) {
  const L = s.lady;
  const out = [];
  out.push(`Item, of ${L.name} of the house of ${L.house}, born in the year ${CONFIG.birthYear}, married at eighteen to ${s.flags.firstHusband}.`);
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
    out.push(`She bore ${born} ${born > 1 ? 'children' : 'child'}, of whom ${living.length || 'none'} ${living.length === 1 ? 'was' : 'were'} living at the end.`);
    for (const c of living.filter((c) => c.betrothed)) out.push(`${c.name} was promised to the house of ${c.betrothed.name.replace(/^the lord of /, '')}.`);
  }
  const lost = s.landsStart - s.lands;
  if (s.landsStart) out.push(lost > 0 ? `Of ${s.landsStart} holdings, ${lost} were lost in the troubles.` : lost < 0 ? 'Her house held more land at the end than at the beginning.' : 'Her house kept every holding it had, through all the troubles.');
  if (s.money < 0) out.push(`She died owing ${-s.money} livres.`);
  out.push(`She was ${repWord(s.rep)}.`);
  if (s.outcome === 'dead') out.push(({ childbed: `She died in childbed in the year ${yearOf(s.turn)}.`, sickness: `She died of the sickness in Paris in the year ${yearOf(s.turn)}.`, violence: `She was killed in Paris in the year ${yearOf(s.turn)}, when the Burgundians broke the prisons.` })[s.flags.death] || `She died of a fever in the year ${yearOf(s.turn)}.`);
  else if (s.outcome === 'ruined') out.push(`In the year ${yearOf(s.turn)} her creditors took the house.`);
  else if (s.flags.convent) out.push('She ended her days among the Poor Clares, and was buried in their church.');
  else out.push('She outlived the mad king, which was more than many managed.');
  return out.join(' ');
}

export function finish(s, outcome) {
  s.over = true;
  s.outcome = s.outcome || outcome;
  s.phase = 'over';
  s.cards = [];
  const sc = score(s);
  s.ending = { ...sc, epitaph: epitaph(s) };
  return s;
}

export { CAST };
