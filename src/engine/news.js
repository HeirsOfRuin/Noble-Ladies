// News and rumour (design rule 3: unreliable information). True warnings of a
// coming swing reach her only sometimes, and false ones arrive too, looking the
// same. The quality of a source sets the mix. Every warning makes a CLAIM (who
// is about to win) that the player can read from its words; the bot reads the
// same claim and never the hidden truth.

import { SWINGS, FALSE_RUMOURS } from '../data/history.data.js';
import { CAST } from '../data/cast.data.js';
import { CONFIG } from '../data/config.data.js';
import { turnOfKey, factionLabel } from './clock.js';
import { relWord } from './derive.js';

function upcoming(s, horizon) {
  return Object.keys(SWINGS).filter((k) => { const t = turnOfKey(k); return t > s.turn && t <= s.turn + horizon; });
}

const FALSE_WARNING = {
  bur: (t) => `They say Burgundian men are already inside the walls, waiting for a signal against ${factionLabel('arm', t)}.`,
  arm: (t) => `They say ${factionLabel('arm', t)} have bought a captain of the gates, and the Burgundians will be out by spring.`,
};

function srcLabel(s, src) {
  if (!src || src === 'talk') return { src: 'talk', srcLabel: 'talk in the city', srcWord: 'hearsay' };
  const n = s.npcs[src];
  return { src, srcLabel: n.name || CAST[src].name, srcWord: relWord(n) };
}

/** One piece of news from a source of the given quality (0-1). May add nothing. */
export function addNews(s, rng, { quality, src = 'talk', horizon = CONFIG.warningLead } = {}) {
  const base = { id: s.nextId++, turn: s.turn, ...srcLabel(s, src), status: null };
  const next = upcoming(s, horizon);
  if (next.length && rng.chance(quality)) {
    const key = next[0], w = SWINGS[key];
    const given = s.news.filter((n) => n.about === key).map((n) => n.text);
    const text = w.warnings.find((x) => !given.includes(x)) || rng.pick(w.warnings);
    s.news.push({ ...base, text, claim: { winner: w.winner, losers: w.losers }, about: key, truth: true });
    return true;
  }
  if (rng.chance(1 - quality)) {
    if (rng.chance(0.5)) {
      const winner = rng.pick(['arm', 'bur']);
      s.news.push({ ...base, text: FALSE_WARNING[winner](s.turn), claim: { winner, losers: [winner === 'arm' ? 'bur' : 'arm'] }, about: null, truth: false });
    } else {
      s.news.push({ ...base, text: rng.pick(FALSE_RUMOURS), claim: null, about: null, truth: false });
    }
    return true;
  }
  return false;
}

/** The half-year's ambient news: what reaches her without asking. */
export function ambientNews(s, rng, place) {
  // Talk at court is thinner than letters from people who know (FRAME-ROUND3: K2).
  const q = place === 'court' ? 0.05 + s.info / 200 : s.info / 400;
  addNews(s, rng, { quality: Math.min(0.9, q), src: 'talk' });
}

/** After a swing: warnings about it came true; old false claims came to nothing. */
export function settleNews(s, swungKey) {
  for (const n of s.news) {
    if (swungKey && n.about === swungKey) n.status = 'true';
    if (!n.truth && n.claim && n.status === null && s.turn - n.turn >= 3) n.status = 'false';
  }
  if (s.news.length > 60) s.news.splice(0, s.news.length - 60);
}

/** Warnings she could read now (last two half-years), as the bot and the News tab see them. */
export function liveWarnings(s) {
  return s.news.filter((n) => n.claim && s.turn - n.turn <= 2 && n.status === null);
}
