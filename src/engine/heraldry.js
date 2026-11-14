// Coats of arms for the invented houses: her father's Brécourt, her husband's,
// the houses her children are promised to. Pure: arms come from the house's
// name (the same name always bears the same arms, so nothing is added to the
// save), the blazon is text, the drawing is an SVG string the UI drops in.
// Adapted from The Lists (src/engine/heraldry.js), which proved it on a phone.
//
// The rule of tincture holds: a metal never on a metal, a colour never on a
// colour. A married woman bore her husband's arms and her father's side by side
// on one shield, "impaled": his on the dexter (the viewer's left), hers on the
// sinister. The real princes are not drawn: their arms are known, and a wrong
// lion is worse than none.

const METALS = ['or', 'argent'];
const COLOURS = ['gules', 'azure', 'vert', 'sable'];

export const TINCTURES = { or: '#d4a82a', argent: '#eeeae0', gules: '#b3262c', azure: '#24539e', vert: '#2f6b3a', sable: '#1d1b1a' };

const DIVISIONS = ['perPale', 'perFess', 'perBend', 'quarterly', 'fess', 'pale', 'bend', 'chevron', 'cross', 'saltire', 'chief', 'bordure'];
const CHARGES = ['none', 'none', 'mullets', 'roundels', 'annulets'];

const BLAZON = {
  perPale: (a, b) => `Per pale ${a} and ${b}`,
  perFess: (a, b) => `Per fess ${a} and ${b}`,
  perBend: (a, b) => `Per bend ${a} and ${b}`,
  quarterly: (a, b) => `Quarterly ${a} and ${b}`,
  fess: (a, b) => `${cap(a)}, a fess ${b}`,
  pale: (a, b) => `${cap(a)}, a pale ${b}`,
  bend: (a, b) => `${cap(a)}, a bend ${b}`,
  chevron: (a, b) => `${cap(a)}, a chevron ${b}`,
  cross: (a, b) => `${cap(a)}, a cross ${b}`,
  saltire: (a, b) => `${cap(a)}, a saltire ${b}`,
  chief: (a, b) => `${cap(a)}, a chief ${b}`,
  bordure: (a, b) => `${cap(a)}, a bordure ${b}`,
};
const CHARGE_WORD = { mullets: 'three mullets', roundels: 'three roundels', annulets: 'three annulets' };

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/** A small seeded generator from a name, so the same house always bears the same arms. */
function nameRng(name) {
  let h = 2166136261;
  for (const ch of String(name)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return () => { h = (h + 0x6d2b79f5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (r, xs) => xs[Math.floor(r() * xs.length)];

/** The arms a house of this name bears. */
export function armsOf(name) {
  const r = nameRng(String(name).replace(/^(the lord of|Messire|Dame|Sire)\s+/i, '').trim());
  const metalFirst = r() < 0.5;
  const field = metalFirst ? pick(r, METALS) : pick(r, COLOURS);
  const tincture = metalFirst ? pick(r, COLOURS) : pick(r, METALS);
  const division = pick(r, DIVISIONS);
  // Charges sit on the field, so they take the ordinary's tincture: the rule holds.
  const charge = ['fess', 'chevron', 'bend', 'chief', 'bordure'].includes(division) ? pick(r, CHARGES) : 'none';
  return { field, tincture, division, charge };
}

export function blazon(a) {
  const base = BLAZON[a.division](a.field, a.tincture);
  if (a.charge === 'none') return base;
  const ch = `${CHARGE_WORD[a.charge]} ${a.tincture}`;
  if (a.division === 'chief') return `${cap(a.field)}, ${ch}, a chief ${a.tincture}`;
  if (a.division === 'bordure') return `${cap(a.field)}, ${ch} within a bordure ${a.tincture}`;
  return `${base} between ${ch}`;
}

/** The field and ordinary, drawn into a 100 x 120 box. */
function fieldSvg(a) {
  const f = TINCTURES[a.field], c = TINCTURES[a.tincture];
  let body = '';
  switch (a.division) {
    case 'perPale': body = `<rect x="50" width="50" height="120" fill="${c}"/>`; break;
    case 'perFess': body = `<rect y="56" width="100" height="64" fill="${c}"/>`; break;
    case 'perBend': body = `<polygon points="0,0 100,120 0,120" fill="${c}"/>`; break;
    case 'quarterly': body = `<rect x="50" width="50" height="56" fill="${c}"/><rect y="56" width="50" height="64" fill="${c}"/>`; break;
    case 'fess': body = `<rect y="44" width="100" height="24" fill="${c}"/>`; break;
    case 'pale': body = `<rect x="37" width="26" height="120" fill="${c}"/>`; break;
    case 'bend': body = `<line x1="0" y1="0" x2="100" y2="120" stroke="${c}" stroke-width="22"/>`; break;
    case 'chevron': body = `<polyline points="2,98 50,46 98,98" fill="none" stroke="${c}" stroke-width="18"/>`; break;
    case 'cross': body = `<rect x="39" width="22" height="120" fill="${c}"/><rect y="44" width="100" height="22" fill="${c}"/>`; break;
    case 'saltire': body = `<line x1="0" y1="0" x2="100" y2="120" stroke="${c}" stroke-width="17"/><line x1="100" y1="0" x2="0" y2="120" stroke="${c}" stroke-width="17"/>`; break;
    case 'chief': body = `<rect width="100" height="34" fill="${c}"/>`; break;
    case 'bordure': body = `<path d="M4,4 H96 V58 C96,90 72,108 50,116 C28,108 4,90 4,58 Z" fill="none" stroke="${c}" stroke-width="22"/>`; break;
    default: body = '';
  }
  // Three charges, two and one, placed off the ordinary.
  const at = a.division === 'chief' ? [[30, 62], [70, 62], [50, 92]] : a.division === 'bordure' ? [[36, 38], [64, 38], [50, 70]] : a.division === 'bend' ? [[72, 26], [22, 66], [42, 96]] : [[22, 24], [78, 24], [50, 96]];
  const ch = a.charge === 'none' ? '' : at.map(([x, y]) => {
    // A charge on the field takes the ordinary's tincture.
    if (a.charge === 'roundels') return `<circle cx="${x}" cy="${y}" r="8" fill="${c}"/>`;
    if (a.charge === 'annulets') return `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${c}" stroke-width="3.5"/>`;
    const p = [];
    for (let i = 0; i < 10; i++) { const rr = i % 2 ? 4 : 10, t = -Math.PI / 2 + i * Math.PI / 5; p.push(`${(x + rr * Math.cos(t)).toFixed(1)},${(y + rr * Math.sin(t)).toFixed(1)}`); }
    return `<polygon points="${p.join(' ')}" fill="${c}"/>`;
  }).join('');
  return `<rect width="100" height="120" fill="${f}"/>${body}${ch}`;
}

const SHAPE = 'M4,4 H96 V58 C96,90 72,108 50,116 C28,108 4,90 4,58 Z';
let uidN = 0;

/** One house's shield. */
export function shieldSvg(name, { size = 44, label = '' } = {}) {
  const a = armsOf(name);
  const id = `sh${++uidN}`;
  return `<svg class="shield" width="${size}" height="${Math.round(size * 1.2)}" viewBox="0 0 100 120" role="img" aria-label="${esc(label || blazon(a))}">` +
    `<defs><clipPath id="${id}"><path d="${SHAPE}"/></clipPath></defs>` +
    `<g clip-path="url(#${id})">${fieldSvg(a)}</g>` +
    `<path d="${SHAPE}" fill="none" stroke="#5a3d0a" stroke-width="3"/></svg>`;
}

/** A married woman's shield: her husband's arms on the dexter half, her father's on the sinister. */
export function impaledSvg(husband, father, { size = 56 } = {}) {
  const id = `im${++uidN}`;
  const a = armsOf(husband), b = armsOf(father);
  return `<svg class="shield" width="${size}" height="${Math.round(size * 1.2)}" viewBox="0 0 100 120" role="img" aria-label="${esc(`Her arms: ${blazon(a)}, impaling ${blazon(b).charAt(0).toLowerCase() + blazon(b).slice(1)}`)}">` +
    `<defs><clipPath id="${id}"><path d="${SHAPE}"/></clipPath><clipPath id="${id}l"><rect width="50" height="120"/></clipPath><clipPath id="${id}r"><rect x="50" width="50" height="120"/></clipPath></defs>` +
    `<g clip-path="url(#${id})"><g clip-path="url(#${id}l)">${halfSvg(a, 0)}</g><g clip-path="url(#${id}r)">${halfSvg(b, 50)}</g>` +
    `<line x1="50" y1="0" x2="50" y2="120" stroke="#5a3d0a" stroke-width="1.5"/></g>` +
    `<path d="${SHAPE}" fill="none" stroke="#5a3d0a" stroke-width="3"/></svg>`;
}

/** Each house's arms squeezed into its half, as impaled arms were drawn. */
function halfSvg(a, x) {
  return `<g transform="translate(${x} 0) scale(0.5 1)">${fieldSvg(a)}</g>`;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
