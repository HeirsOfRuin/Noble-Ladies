// Act 1: the contract. Seven scenes in 1400; she is seventeen. The last scene
// fixes the husband, the dowry and the dower clause, and the wedding follows in
// the spring of 1401, after her eighteenth birthday (test/invariants.test.js
// asserts both ages).

import { ACT1, ACT1_LATE } from '../data/act1.data.js';
import { ACT1_CAST, CAST } from '../data/cast.data.js';
import { CONFIG } from '../data/config.data.js';
import { ACT_CARDS } from '../data/history.data.js';
import { applyOps, describeOps, gainRep } from './effects.js';
import { coin } from './ledger.js';
import { relWord, pct } from './derive.js';
import { ladyAge, FIRST_TURN, factionLabel } from './clock.js';
import { wantCard } from './arcs.js';

const TRAITS = {
  temper: { high: '{X} has a temper. His servants are afraid of him.', low: '{X} is even-tempered, they say, and slow to anger.' },
  spending: { high: '{X} lives beyond his means. His tailor has not been paid since Michaelmas.', low: '{X} counts every denier, and his steward likes him for it.' },
  competence: { high: '{X} is able. His lord trusts him with real business.', low: '{X} is thought slow in council, and knows it.' },
  loyalty: { high: '{X} keeps faith with the people close to him.', low: '{X} keeps faith with nobody for long.' },
};

export const sceneOf = (s) => ACT1[s.turn - 1];

function sceneText(s, raw) {
  const [a, b] = s.act1.suitors;
  const fp = s.act1.suitors[s.act1.fatherPick];
  const other = s.act1.suitors[1 - s.act1.fatherPick];
  const map = {
    a: a.short, b: b.short, A: a.name, B: b.name,
    father: ACT1_CAST.father, governess: ACT1_CAST.governess, lady: s.lady.name,
    fatherPick: fp.name,
    fatherWhy: `${fp.short} holds ${fp.lands} holdings to ${other.short}'s ${other.lands}, and asks ${fp.dowryAsk < other.dowryAsk ? 'less' : 'no less'} in dowry.`,
    persuadeText: persuadeText(s),
    contractText: contractText(s),
  };
  return raw.replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
}

function persuadeText(s) {
  const { prefer, fatherPick, suitors } = s.act1;
  if (prefer === -1) return '';
  if (prefer === null) return 'You have left the choice to your father, and he will take ' + suitors[fatherPick].short + '. But the terms are still open: how much he pays, and what he asks for you in return. Someone can speak to him about that.';
  if (prefer === fatherPick) return `Your father already leans toward ${suitors[prefer].short}. A word in the right ear would settle it, and might improve the terms.`;
  return `Your father leans toward ${suitors[fatherPick].short}. To change his mind, someone he listens to must speak for ${suitors[prefer].short}, and not too obviously on your behalf.`;
}

function contractText(s) {
  const { pick, suitors, prefer } = s.act1;
  if (pick === undefined) return '';
  const h = suitors[pick];
  const got = prefer === null ? 'You left it to him.' : prefer === pick ? 'The match is the one you wanted.' : 'He heard what was said for you, and decided otherwise.';
  const dowry = h.dowryAsk + s.act1.dowryBonus;
  return `Your father has settled on ${h.name}. ${got} ${h.note} The dowry agreed is ${dowry} livres. The wedding is set for the spring, after your eighteenth birthday.\n\nThe lawyers have drawn the contract in the usual form. In return for the dowry you are to swear that you will claim nothing more of your father's lands, now or after his death. Daughters do; few think about it. There is also the matter of your dower, should you be widowed.`;
}

function viaWord(s, via) {
  if (via === 'governess') return 'your governess';
  if (via === 'self') return 'yourself';
  return `${CAST[via].short} (${relWord(s.npcs[via])})`;
}

export function persuadeChance(s, c) {
  if (c.via === 'self') return Math.min(0.85, c.base + s.rep / 300);
  if (c.via === 'governess') return Math.min(0.85, c.base + 0.1);
  const n = s.npcs[c.via];
  return Math.min(0.85, (c.base + n.trust / 250 + (c.via === 'confessor' ? s.rep / 400 : 0)) * (0.7 + 0.3 * n.rel));
}

function stakeFor(s, c) {
  if (c.kind === 'gamble' || c.kind === 'dowry') return `Even chance: ${describeOps(c.win)}; otherwise ${describeOps(c.lose)}`;
  if (c.kind === 'source') return `${c.reports} report${c.reports > 1 ? 's' : ''}, through ${viaWord(s, c.via)}${c.info ? ` · Information +${c.info}` : ''}`;
  if (c.kind === 'persuade') return `${pct(persuadeChance(s, c))} chance, through ${viaWord(s, c.via)}${c.failRep ? ` · if it fails, Reputation ${c.failRep}` : ''}${c.rep ? ` · Reputation +${c.rep}` : ''}`;
  if (c.kind === 'prefer') return c.ops ? describeOps(c.ops) : '';
  return describeOps(c.ops);
}

export function sceneView(s) {
  const sc = sceneOf(s);
  return {
    kind: 'scene', id: sc.id, when: sc.when, lesson: sc.lesson, age: ladyAge(s.turn),
    governess: sc.governess, text: sceneText(s, sc.text),
    reports: sc.id === 'choice' || sc.id === 'contract' ? s.act1.reports.map((r) => r.text) : [],
    choices: sc.choices.map((c) => ({ label: sceneText(s, c.label), note: c.note || '', stake: stakeFor(s, c) })),
  };
}

function report(s, via, i, rng) {
  const n = s.npcs[via];
  const sx = s.act1.suitors[i % 2];
  const trait = rng.pick(Object.keys(TRAITS));
  const truth = sx[trait] >= 3 ? 'high' : 'low';
  const honest = rng.chance(n.rel);
  const claim = honest ? truth : truth === 'high' ? 'low' : 'high';
  const text = `${CAST[via].short[0].toUpperCase() + CAST[via].short.slice(1)} says: ${TRAITS[trait][claim].replace('{X}', sx.short)}`;
  s.act1.reports.push({ text, suitor: sx.id, trait, claim, honest });
}

/** Resolve one Act 1 scene. Returns the lines of what happened. */
export function resolveScene(s, choice, rng) {
  const sc = sceneOf(s);
  const c = sc.choices[choice];
  if (!c) throw new Error(`no such choice: ${choice}`);
  const lines = [];
  if (c.ops) applyOps(s, c.ops);
  if (c.kind === 'gamble' || c.kind === 'dowry') {
    const won = rng.chance(c.p);
    applyOps(s, won ? c.win : c.lose);
    lines.push(won ? 'It went as you hoped.' : 'It went badly.');
  } else if (c.kind === 'source') {
    for (let i = 0; i < c.reports; i++) report(s, c.via, s.act1.reports.length + i, rng);
    s.npcs[c.via].seen += 1;
    if (c.info) s.info = Math.min(100, s.info + c.info);
    if (c.rep) gainRep(s, c.rep);
    lines.push(...s.act1.reports.slice(-c.reports).map((r) => r.text));
  } else if (c.kind === 'prefer') {
    s.act1.prefer = c.pick;
  } else if (c.kind === 'persuade') {
    const ok = rng.chance(persuadeChance(s, c));
    if (c.via !== 'self' && c.via !== 'governess') s.npcs[c.via].seen += 1;
    if (c.rep) gainRep(s, c.rep);
    if (ok) {
      s.act1.press += 2;
      if (s.act1.prefer === null || s.act1.prefer === s.act1.fatherPick) s.act1.dowryBonus += 300;
      lines.push('Your father listened.');
    } else {
      if (c.failRep) gainRep(s, c.failRep);
      lines.push('Your father was not moved.');
    }
    const { prefer, fatherPick, press } = s.act1;
    s.act1.pick = prefer === null || prefer === fatherPick ? fatherPick : press >= 2 ? prefer : fatherPick;
  }
  if (sc.id === 'court') {
    const joined = c.ops.find((o) => o[0] === 'fav')[1];
    s.npcs.rival.faction = joined === 'bur' ? 'arm' : 'bur';
  }
  if (sc.id === 'contract') wedding(s, lines);
  return lines;
}

/** End of Act 1: the marriage, and the household it makes. */
function wedding(s, lines) {
  const h = s.act1.suitors[s.act1.pick];
  const dowry = h.dowryAsk + s.act1.dowryBonus;
  s.husband = {
    id: h.id, name: h.name, short: h.short, lean: h.lean,
    competence: h.competence, loyalty: h.loyalty, temper: h.temper, spending: h.spending,
    heed: 15 + h.loyalty * 9 + (s.act1.prefer === s.act1.pick ? 10 : 0),
    status: 'present', away: 0, ransom: null, age: h.age,
    regard: 40 + (s.act1.prefer === s.act1.pick ? 10 : 0),
  };
  s.flags.husbandShort = h.short;
  if (s.flags.renounced === undefined) s.flags.renounced = true;
  s.lands = h.lands; s.landsStart = h.lands;
  coin(s, CONFIG.startPurse, 'the household purse', FIRST_TURN - 1);
  coin(s, dowry, 'your dowry', FIRST_TURN - 1);
  s.place = 'court';
  const lean = h.lean === 'none' ? 'belongs to no party' : `is known as a friend of ${factionLabel(h.lean, FIRST_TURN)}`;
  s.cards.push({
    id: 'wedding', title: 'The wedding', when: 'April 1401',
    text: `In April 1401, at eighteen, you marry ${h.name} in the chapel at Brécourt, where your father and his father were married. Your father pays ${dowry} livres. Your husband holds ${h.lands} holdings and ${lean}. You leave your mother's house with Perrette, two chests, and the book of hours your mother gave you, with wide margins, "for your own thoughts, which nobody else will want."`,
    lines: [ACT_CARDS[2]], choices: [{ label: 'Begin', ops: [] }],
  });
  s.cards.push(wantCard(s));
  lines.push(`Married to ${h.name}. Age at the wedding: ${ladyAge(FIRST_TURN)}.`);
}

export function lateCard(id) {
  const c = ACT1_LATE[id];
  return { id, title: c.title, text: c.text, choices: c.choices.map((x) => ({ ...x })) };
}
