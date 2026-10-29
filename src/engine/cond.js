// Conditions as data. Story beats (src/data/arcs.data.js) say when they can fire
// and which choices are open with small arrays, not functions, so a validator
// can read them: every flag a condition reads must be set by some effect, and an
// unknown condition is an error at load, not a silent false (Knight of Adalia's
// rule: unknown condition paths fail the build).
//
//   ['flag', key]             s.flags[key] is truthy
//   ['flag', key, value]      s.flags[key] === value
//   ['not', cond]  ['any', [cond...]]  ['all', [cond...]]
//   ['trust', npc, op, n]  ['use', npc, op, n]  ['alive', npc]
//   ['fav', faction, op, n]  ['rep', op, n]  ['money', op, n]  ['health', op, n]
//   ['trait', axis, op, n]    devout | bold | warm, each -5..5
//   ['want', id]              her ambition
//   ['husband', status]       present | away | captured | dead | none | alive | first
//   ['lean', faction]         her husband's party
//   ['temper', op, n]  ['spending', op, n]  ['regard', op, n]   her husband's traits and regard
//   ['place', court|estates]  where she is this half-year
//   ['son']  ['children', op, n]
//   ['beat', id]              that story beat has fired
//   ['agincourt', fate]       killed | captured | survived | absent

const OPS = {
  '>=': (a, b) => a >= b, '<=': (a, b) => a <= b, '>': (a, b) => a > b, '<': (a, b) => a < b, '==': (a, b) => a === b,
};

const cmp = (a, op, b) => {
  if (!OPS[op]) throw new Error(`unknown comparison ${op}`);
  return OPS[op](a, b);
};

export function test(s, c) {
  if (!c) return true;
  const [k, a, b, n] = c;
  switch (k) {
    case 'flag': return c.length === 2 ? !!s.flags[a] : s.flags[a] === b;
    case 'not': return !test(s, a);
    case 'any': return a.some((x) => test(s, x));
    case 'all': return a.every((x) => test(s, x));
    case 'trust': case 'use': return !!s.npcs[a]?.alive && cmp(s.npcs[a][k], b, n);
    case 'alive': return !!s.npcs[a]?.alive;
    case 'fav': return cmp(s.fav[a], b, n);
    case 'rep': return cmp(s.rep, a, b);
    case 'money': return cmp(s.money, a, b);
    case 'health': return cmp(s.health, a, b);
    case 'trait': return cmp(s.traits?.[a] ?? 0, b, n);
    case 'want': return s.want === a;
    case 'husband': {
      const h = s.husband;
      if (a === 'none') return !h;
      if (a === 'alive') return !!h && h.status !== 'dead';
      if (a === 'first') return !!h && !s.flags.remarried;
      return !!h && h.status === a;
    }
    case 'lean': return !!s.husband && s.husband.lean === a;
    case 'temper': case 'spending': return !!s.husband && cmp(s.husband[k], a, b);
    case 'regard': return !!s.husband && cmp(s.husband.regard ?? 40, a, b);
    case 'place': return s.place === a;
    case 'son': return s.children.some((x) => x.alive && x.sex === 'son');
    case 'children': return cmp(s.children.filter((x) => x.alive).length, a, b);
    case 'beat': return s.arcs?.[a] === 'done';
    case 'agincourt': return s.flags.agincourt === a;
    default: throw new Error(`unknown condition: ${k}`);
  }
}

export const all = (s, conds = []) => conds.every((c) => test(s, c));

/** Flags a condition reads (for the validator). */
export function flagsRead(c, out = new Set()) {
  if (!c) return out;
  const [k, a] = c;
  if (k === 'flag') out.add(a);
  else if (k === 'not') flagsRead(a, out);
  else if (k === 'any' || k === 'all') for (const x of a) flagsRead(x, out);
  return out;
}

export const KNOWN = new Set(['flag', 'not', 'any', 'all', 'trust', 'use', 'alive', 'fav', 'rep', 'money', 'health', 'trait', 'want', 'husband', 'lean', 'temper', 'spending', 'regard', 'place', 'son', 'children', 'beat', 'agincourt']);
