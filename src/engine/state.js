// New game, the save contract, and migrations.
//
// The save KEY is a contract: renaming it orphans every save on every device
// (Silk Road kept its old key after the retitle on purpose). The payload carries
// `v`; MIGRATIONS[v] upgrades version v to v + 1. Every version that ever
// shipped gets a fixture in test/fixtures/ that must load and play on
// (test/save-contract.test.js). Ids and counters live IN STATE, never in module
// variables, or one seed gives different games in a batch (Centennial Farm).

import { CONFIG, DIFFICULTY } from '../data/config.data.js';
import { CAST, SUITORS, LADY } from '../data/cast.data.js';
import { streamFor } from './rng.js';

export const SAVE_KEY = 'the-lady-of-saint-pol.save.v1'; // never rename
export const SAVE_VERSION = 2;
export const CODE_PREFIX = 'LSP1.';

const draw = (rng, v, dp = 0) => {
  if (!Array.isArray(v)) return v;
  const x = rng.float(v[0], v[1]);
  return dp ? Math.round(x * 10 ** dp) / 10 ** dp : Math.round(x);
};

export function makeNpc(id, rng) {
  const c = CAST[id];
  return {
    id, alive: true, gone: null,
    trust: draw(rng, c.trust), use: draw(rng, c.use),
    rel: draw(rng, c.rel, 2), loyalty: draw(rng, c.loyalty, 2),
    faction: c.faction,
    seen: c.real ? 0 : (c.role === 'family' || c.role === 'confessor' ? 3 : 0), // long-known people are already known
    gifts: [],
  };
}

function makeSuitor(t, rng) {
  const nudge = (x) => Math.max(1, Math.min(5, x + rng.range(-1, 1)));
  return { ...t, competence: nudge(t.competence), loyalty: nudge(t.loyalty), temper: nudge(t.temper), spending: nudge(t.spending) };
}

/** Her name as the player gave it: letters, spaces, apostrophes and hyphens, at most 24 characters. */
export function cleanName(name) {
  const n = String(name || '').replace(/[^\p{L}' -]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  return n || LADY.name;
}

export function newGame({ seed = 1, difficulty = 'normal', name } = {}) {
  if (!DIFFICULTY[difficulty]) throw new Error(`unknown difficulty: ${difficulty}`);
  const rng = streamFor(seed >>> 0, 0, 'setup');
  const npcs = {};
  for (const id of Object.keys(CAST)) npcs[id] = makeNpc(id, rng);

  // Two suitors with different leanings: the faction bet starts at the contract.
  const pool = rng.shuffle(SUITORS.slice());
  const a = pool[0];
  const b = pool.find((x) => x.lean !== a.lean);
  const suitors = [makeSuitor(a, rng), makeSuitor(b, rng)];
  const fatherPick = suitors[0].lands >= suitors[1].lands ? 0 : 1;

  return {
    v: SAVE_VERSION,
    seed: seed >>> 0,
    difficulty,
    lady: { ...LADY, name: cleanName(name), title: `${cleanName(name)} de ${LADY.house}` },
    traits: { devout: 0, bold: 0, warm: 0 },
    want: null,
    arcs: {},
    turn: 1,
    phase: 'scene',
    money: 0,
    ledger: [],
    rep: CONFIG.startRep,
    fav: { queen: 5, arm: 5, bur: 5 },
    info: CONFIG.startInfo,
    hh: CONFIG.startHousehold,
    health: CONFIG.startHealth,
    lands: 0, landsStart: 0,
    confiscated: [],
    pensions: [],
    place: 'estates',
    counsel: 'none',
    npcs,
    husband: null,
    widowed: false,
    children: [],
    births: 0,
    pregnant: null,
    guard: 0,
    cause: null,
    queue: [],
    cards: [],
    news: [],
    history: [],
    flags: {},
    act1: { suitors, fatherPick, prefer: -1 /* -1 not yet asked; null left to her father; 0 or 1 a suitor */, press: 0, dowryBonus: 0, reports: [] },
    over: false,
    outcome: null,
    ending: null,
    nextId: 1,
  };
}

/** MIGRATIONS[v](save) returns the save at version v + 1. Add one per version bump. */
export const MIGRATIONS = {
  // v2 (2026-10-29): her character, her ambition, story beats, her husband's
  // regard. A v1 game carries on: beats already past are passed by, and its
  // contract is read as the usual one (the inheritance renounced).
  1: (s) => {
    const flags = { renounced: true, ...s.flags };
    if (s.husband && !flags.husbandShort) flags.husbandShort = s.husband.short;
    const husband = s.husband ? { regard: 40, ...s.husband } : s.husband;
    return { ...s, v: 2, traits: { devout: 0, bold: 0, warm: 0 }, want: null, arcs: {}, flags, husband };
  },
};

export function migrate(save) {
  let s = save;
  if (!s || typeof s !== 'object' || !Number.isInteger(s.v)) throw new Error('not a save');
  if (s.v > SAVE_VERSION) throw new Error(`save is from a newer version (${s.v}) than this build (${SAVE_VERSION})`);
  while (s.v < SAVE_VERSION) {
    const step = MIGRATIONS[s.v];
    if (!step) throw new Error(`no migration from save version ${s.v}`);
    s = step(s);
  }
  return s;
}

export const serialize = (state) => JSON.stringify(state);
export const deserialize = (text) => migrate(JSON.parse(text));

/** A save as text, to move between devices or between itch and the Pages copy. */
export function toCode(state) {
  const b64 = btoa(unescape(encodeURIComponent(serialize(state))));
  return CODE_PREFIX + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromCode(code) {
  const text = String(code).trim();
  if (!text.startsWith(CODE_PREFIX.slice(0, -2))) throw new Error('That is not a save code for this game.');
  const body = text.slice(text.indexOf('.') + 1).replace(/-/g, '+').replace(/_/g, '/');
  return deserialize(decodeURIComponent(escape(atob(body))));
}
