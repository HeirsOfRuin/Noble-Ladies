// The family: births, the children, the husband's own decisions, his fate at
// Agincourt, and widowhood. Design rule 5: mortality is handled soberly, as a
// risk she manages (health, rest, where she lies in, the children's care), not
// a random punishment. Risks are shown on the House tab from the same functions.

import { CONFIG } from '../data/config.data.js';
import { CHILD_NAMES, MATCH_HOUSES } from '../data/cast.data.js';
import { PLAGUE } from '../data/history.data.js';
import { coin } from './ledger.js';
import { clamp, gainRep } from './effects.js';
import { D, husbandHere, childAge, costOf } from './derive.js';
import { keyOf, factionLabel } from './clock.js';

/** Her risk of dying in childbed if a child is born this half-year. */
export function birthRisk(s, place = s.place) {
  const base = CONFIG.birthRiskBase * (1.6 - s.health / 100) * D(s).dangerMult;
  return clamp(base * (place === 'estates' ? 0.75 : 1.15), 0.005, 0.25);
}

export function childRisk(s, c, care = false) {
  if (!c.alive || childAge(s, c) >= 5) return 0;
  const plague = PLAGUE[keyOf(s.turn)] || 0;
  return CONFIG.infantDeathPerTurn * (1 - c.care / 200) * (1 + plague) * (s.hh < 30 ? 1.5 : 1) * (care ? 0.5 : 1);
}

export const WAR = new Set(['1410b', '1411a', '1411b', '1412a', '1414a', '1417b', '1418a', '1418b', '1419a', '1419b', '1421a']);

/** Births, the children's health, the husband's movements. Pushes cards for what matters. */
export function familyTurn(s, rng, place, ctx) {
  const h = s.husband;
  const lines = [];

  // Childbed: a pregnancy begun last half-year comes to term now.
  if (s.pregnant && s.pregnant <= s.turn) {
    s.pregnant = null;
    if (rng.chance(birthRisk(s, place))) {
      s.over = true; s.outcome = 'dead'; s.flags.death = 'childbed';
      return [`You died in childbed in the ${keyOf(s.turn).endsWith('a') ? 'spring' : 'autumn'} of ${keyOf(s.turn).slice(0, 4)}.`];
    }
    s.health = clamp(s.health - 15, Math.min(5, s.health));
    s.births += 1;
    if (rng.chance(0.1)) {
      s.cards.push({ id: 'stillborn', title: 'A child stillborn', text: 'The child was born dead. Brother Robert said what prayers the Church allows.', choices: [{ label: 'Continue', ops: [] }] });
    } else {
      const sex = rng.chance(0.5) ? 'son' : 'daughter';
      const used = s.children.map((c) => c.name);
      const name = rng.pick(CHILD_NAMES[sex].filter((n) => !used.includes(n))) || CHILD_NAMES[sex][0];
      s.children.push({ id: s.nextId++, name, sex, born: s.turn, alive: true, care: 30, betrothed: null });
      s.cards.push({ id: 'birth', title: `A ${sex}`, text: `You are delivered of a ${sex}. ${name} is baptised within the week. Your health is spent for a while.`, choices: [{ label: 'Continue', ops: [] }] });
    }
  }

  // A new pregnancy
  const lastBirth = s.children.reduce((m, c) => Math.max(m, c.born), 0);
  if (husbandHere(s) && !s.pregnant && s.births < CONFIG.maxBirths && s.turn - lastBirth >= 2 && rng.chance(CONFIG.pregnancyChance)) {
    s.pregnant = s.turn + 1;
    lines.push('You are with child. It will come next half-year.');
  }

  // The children
  for (const c of s.children) {
    if (!c.alive) continue;
    if (rng.chance(childRisk(s, c, ctx.care))) {
      c.alive = false;
      s.cards.push({ id: 'child_death', title: `${c.name} is dead`, text: `${c.name} died of a fever at ${childAge(s, c) || 'less than a year'}${childAge(s, c) ? ' years old' : ''}. Children die often. Knowing it is no comfort.`, choices: [{ label: 'Continue', ops: [] }] });
    } else c.care = clamp(c.care - 2);
  }

  // The husband
  if (h && h.status === 'away') { h.away -= 1; if (h.away <= 0) { h.status = 'present'; lines.push(`${h.short} is home from the war.`); } }
  else if (h && h.status === 'present' && WAR.has(keyOf(s.turn)) && h.lean !== 'none' && !h.stay && rng.chance(0.35)) {
    h.status = 'away'; h.away = 1;
    s.fav[h.lean] = clamp(s.fav[h.lean] + 4);
    lines.push(`${h.short} rides with ${factionLabel(h.lean, s.turn)}. He will be away for the half-year.`);
    if (rng.chance(0.05 * D(s).dangerMult)) widow(s, rng, `${h.short} was killed in a skirmish.`);
  } else if (h && h.status === 'captured' && rng.chance(0.02)) {
    widow(s, rng, `${h.short} has died in captivity in England.`);
  }
  if (h && h.status === 'present' && h.temper >= 4 && rng.chance(0.08)) {
    gainRep(s, -3);
    lines.push(`${h.short} struck a man at dinner. People talk. Reputation -3.`);
  }
  return lines;
}

/** Agincourt, 25 October 1415. Not fixed: his traits, his party and her counsel decide. */
export function agincourt(s, rng) {
  const h = s.husband;
  if (!h || !['present', 'away'].includes(h.status)) return [];
  let go = h.lean === 'arm' ? 0.9 : h.lean === 'none' ? 0.75 : 0.45;
  if (h.stay) go *= 1 - h.heed / 150;
  if (!rng.chance(go)) {
    s.flags.agincourt = 'absent';
    return [`${h.short} did not answer the summons. He is alive, and some in Paris say he is a coward for it.`];
  }
  const killed = clamp(0.4 - 0.05 * (h.competence - 3), 0.15, 0.6);
  const r = rng.next();
  if (r < killed) {
    s.flags.agincourt = 'killed';
    widow(s, rng, `${h.short} was killed at Agincourt. His body was found among the dead by his squire.`);
    return [`${h.short} died at Agincourt.`];
  }
  if (r < killed + 0.3) {
    h.status = 'captured';
    h.ransom = { total: costOf(s, 1500 + s.lands * 250), paid: 0 };
    s.flags.agincourt = 'captured';
    return [`${h.short} was taken prisoner. The English ask ${h.ransom.total} livres for him.`];
  }
  s.flags.agincourt = 'survived';
  return [`${h.short} came back from Agincourt alive, on foot, without his horse or his banner.`];
}

/**
 * Widowhood. Customary dower: a widow kept for life the use of half the lands
 * her husband held at the marriage (Beaumanoir's general custom; the later
 * written custom of Paris says the same). With a living son she governs the rest
 * as his guardian. Without one, his kin take their half. If the dower was not
 * assigned on named lands in the contract, the kin can contest it.
 */
export function widow(s, rng, why) {
  const h = s.husband;
  h.status = 'dead';
  s.husband = null;
  s.widowed = true;
  s.pregnant = null;
  const son = s.children.some((c) => c.alive && c.sex === 'son');
  const lines = [why];
  if (!son) {
    const lost = Math.floor(s.lands / 2);
    s.lands -= lost;
    lines.push(`With no son living, ${lost} holdings go back to his kin. You keep your dower: the use of the rest for life.`);
    if (!s.flags.dowerAssigned) s.queue.push({ due: s.turn + 1, kind: 'card', card: 'dower_contest' });
  } else {
    lines.push('Your son is his heir, and you govern his lands as guardian until he is grown.');
    if (!s.flags.dowerAssigned && rng.chance(0.4)) s.queue.push({ due: s.turn + 2, kind: 'card', card: 'dower_contest' });
  }
  s.queue.push({ due: s.turn + 3, kind: 'card', card: 'remarriage' });
  s.cards.push({ id: 'widowed', title: 'Widowed', text: lines.join(' '), lines: ['You are now mistress of your own affairs, as far as the law and his family allow: one more action each half-year, and nobody\'s debts but your own.'], choices: [{ label: 'Continue', ops: [] }] });
}

/** What a house asks before it will offer: a name, friends at court, a well-raised child. */
export const matchNeed = (m) => 45 + m.rank * 15;
export function matchStanding(s, c, m) {
  const friends = Math.max(m.faction === 'none' ? 20 : s.fav[m.faction], s.fav.queen * 0.8);
  return s.rep + friends / 1.5 + c.care / 4;
}

/** Offers for a child's hand. Better houses offer only to a house with a name and friends. */
export function matchOffers(s, c, rng) {
  const offers = rng.shuffle(MATCH_HOUSES.slice()).filter((m) => {
    return matchStanding(s, c, m) >= matchNeed(m);
  }).slice(0, 3);
  const choices = offers.map((m) => {
    const amount = costOf(s, (c.sex === 'daughter' ? 900 : 500) * m.rank);
    const ops = [['purse', c.sex === 'daughter' ? -amount : amount, c.sex === 'daughter' ? `dowry for ${c.name}` : `dowry brought by ${c.name}'s bride`], ['rep', 2]];
    if (m.faction !== 'none') ops.push(['fav', m.faction, 8]);
    return { label: `${m.name} (${['', 'a small house', 'a good house', 'a great house'][m.rank]}, ${m.faction === 'none' ? 'no party' : factionLabel(m.faction, s.turn, true)})`, ops, kind: 'match', child: c.id, house: m };
  });
  choices.push({ label: 'Decline them all for now', ops: [] });
  return {
    id: 'match', title: `A match for ${c.name}`,
    text: offers.length ? `${offers.length} house${offers.length > 1 ? 's have' : ' has'} answered for ${c.name}. A betrothal is a contract: the wedding waits until ${c.name} is grown, but the alliance and the money are settled now.` : `No house of standing has answered for ${c.name}. A better name, more friends at court, or a better-raised child would change that.`,
    choices,
  };
}

export { coin };
