// Manuscript ornament, drawn in SVG strings: no image files, so the one-file
// build stays one file and it scales to any screen. After Knight of Adalia's
// Illumination component (gilt gradient, diapered ground, quatrefoil miniature),
// redrawn for this book: the Hôtel Saint-Pol on the Seine, and a lady at a window.
// Decoration only: it decides nothing and carries no information the text lacks.

const GILT = 'url(#gilt)';

/** Shared paint (gold leaf, diapered grounds). Put on the page once. */
export function artDefs() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="gilt" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f3dc8c"/><stop offset=".45" stop-color="#c99a2e"/><stop offset=".55" stop-color="#e8c66a"/><stop offset="1" stop-color="#8a6416"/>
    </linearGradient>
    <pattern id="diaper" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="#1f3f86"/><path d="M6 0 L12 6 L6 12 L0 6 Z" fill="none" stroke="#2c56a8" stroke-width=".8"/><circle cx="6" cy="6" r="1.1" fill="#e8c66a"/>
    </pattern>
    <pattern id="diaper-red" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="#8e2219"/><path d="M0 0 L10 10 M10 0 L0 10" stroke="#a8362a" stroke-width=".7"/><circle cx="5" cy="5" r=".9" fill="#e8c66a"/>
    </pattern>
  </defs></svg>`;
}

/** A gilded initial: the letter in gold on a red diapered field, framed in gold, white penwork in the corners. */
export function gildedInitial(letter, size = 56) {
  return `<svg class="gilded-initial" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <rect x="1" y="1" width="62" height="62" rx="3" fill="${GILT}"/>
    <rect x="5" y="5" width="54" height="54" rx="2" fill="url(#diaper-red)"/>
    <g stroke="#f6eedb" stroke-width="1" fill="none" opacity=".85"><path d="M8 18 Q8 8 18 8"/><path d="M46 8 Q56 8 56 18"/><path d="M56 46 Q56 56 46 56"/><path d="M18 56 Q8 56 8 46"/></g>
    <text x="32" y="47" text-anchor="middle" font-family="'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif" font-size="44" font-weight="700" fill="${GILT}" stroke="#5a3d0a" stroke-width=".8">${letter}</text>
  </svg>`;
}

/** A gilt rule with a lozenge at its heart, between sections. */
export function giltRule() {
  return `<svg class="gilt-rule" viewBox="0 0 240 14" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <path d="M4 7 H104 M136 7 H236" stroke="${GILT}" stroke-width="2"/>
    <path d="M10 10 H100 M140 10 H230" stroke="#8e2219" stroke-width=".8" opacity=".7"/>
    <path d="M120 1 L128 7 L120 13 L112 7 Z" fill="${GILT}" stroke="#5a3d0a" stroke-width=".6"/>
    <circle cx="120" cy="7" r="2" fill="#1f3f86"/><circle cx="106" cy="7" r="2" fill="${GILT}"/><circle cx="134" cy="7" r="2" fill="${GILT}"/>
  </svg>`;
}

/**
 * The title page's miniature: the Hôtel Saint-Pol on the Seine, its towers and
 * gardens, and in one window a lady in red, looking out. A quatrefoil on a
 * diapered blue ground, framed in gold, as a book of hours opens.
 */
export function miniature(size = 200) {
  const lobes = '<circle cx="100" cy="54" r="44"/><circle cx="146" cy="100" r="44"/><circle cx="100" cy="146" r="44"/><circle cx="54" cy="100" r="44"/><rect x="54" y="54" width="92" height="92"/>';
  const crenel = (x, y, w) => { let d = ''; for (let i = 0; i < w; i += 6) d += `M${x + i} ${y} v-4 h3 v4 `; return `<path d="${d}" fill="none" stroke="#6d5a3a" stroke-width=".8"/>`; };
  return `<svg class="miniature" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="The Hôtel Saint-Pol on the Seine, with a lady at a window">
    <defs><clipPath id="qf">${lobes}</clipPath></defs>
    <g transform="translate(100 100) scale(1.06) translate(-100 -100)" fill="${GILT}">${lobes}</g>
    <g clip-path="url(#qf)">
      <rect width="200" height="200" fill="url(#diaper)"/>
      <path d="M0 150 Q50 140 100 146 T200 142 V200 H0 Z" fill="#3f6e34"/>
      <path d="M0 160 Q60 154 120 160 T200 156 V172 Q140 166 100 172 T0 170 Z" fill="#5d86b8"/>
      <path d="M10 165 Q40 162 70 165 M110 166 Q140 163 170 166" stroke="#dfe8f2" stroke-width="1" fill="none" opacity=".8"/>
      <path d="M0 172 Q60 166 120 172 T200 168 V200 H0 Z" fill="#2f5a2a"/>
      <g fill="#d9cdb3" stroke="#6d5a3a" stroke-width=".8">
        <rect x="40" y="100" width="120" height="46"/>
        <rect x="30" y="80" width="18" height="66"/><rect x="152" y="80" width="18" height="66"/>
        <rect x="88" y="70" width="24" height="76"/>
      </g>
      ${crenel(30, 80, 18)}${crenel(152, 80, 18)}${crenel(88, 70, 24)}${crenel(48, 100, 104)}
      <path d="M30 80 L39 62 L48 80 Z M152 80 L161 62 L170 80 Z" fill="#2b4a7a" stroke="#1f3560" stroke-width=".6"/>
      <path d="M88 70 L100 48 L112 70 Z" fill="#2b4a7a" stroke="#1f3560" stroke-width=".6"/>
      <path d="M100 48 V38" stroke="#3a2a18" stroke-width="1.2"/><path d="M100 38 L112 42 L100 46 Z" fill="#8e2219"/>
      <g fill="#3a2a18"><path d="M58 146 v-14 a5 5 0 0 1 10 0 v14 z"/><path d="M132 146 v-14 a5 5 0 0 1 10 0 v14 z"/></g>
      <path d="M93 104 v-14 a7 7 0 0 1 14 0 v14 z" fill="#f1e6c8" stroke="#6d5a3a" stroke-width=".8"/>
      <circle cx="100" cy="92" r="3" fill="#f0d9c0"/>
      <path d="M96 89 Q100 84 104 89" fill="#f6eedb" stroke="#d9cdb3" stroke-width=".5"/>
      <path d="M95 104 Q95 96 100 95 Q105 96 105 104 Z" fill="#8e2219"/>
      <path d="M93 104 h14" stroke="${GILT}" stroke-width="1.6"/>
      <g fill="#2f6b3a"><circle cx="20" cy="140" r="7"/><circle cx="182" cy="138" r="7"/><circle cx="12" cy="146" r="5"/></g>
      <g fill="${GILT}"><circle cx="20" cy="138" r="1.1"/><circle cx="182" cy="136" r="1.1"/></g>
    </g>
  </svg>`;
}

/**
 * Paris in 1400-1422, schematic: the Seine and its islands, the walls, and the
 * places this game names, the walls coloured by who holds the city: the
 * Burgundians' red cross of Saint Andrew, the Armagnacs' white sash, or the
 * grey of a city still shared between the princes. Not to scale.
 */
export function parisMap(control, here, size = 300) {
  const wall = control === 'bur' ? '#b3262c' : control === 'arm' ? '#f4f0e6' : '#8a7a5a';
  const wallEdge = control === 'arm' ? '#7a6a4a' : '#3a2a18';
  const label = control === 'bur' ? 'Held by the Burgundians' : control === 'arm' ? 'Held by the Armagnacs' : 'Shared between the princes';
  const place = (x, y, name, anchor = 'start', dx = 6) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#2a1f17"/><text x="${x + (anchor === 'end' ? -dx : dx)}" y="${y + 3.5}" text-anchor="${anchor}" class="pm-l">${name}</text>`;
  return `<svg class="paris-map" width="${size}" height="${Math.round(size * 0.78)}" viewBox="0 0 300 234" role="img" aria-label="A map of Paris. ${label}.">
    <style>.pm-l{font:9.5px 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif;fill:#2a1f17}.pm-t{font:italic 9px Georgia,serif;fill:#6b5a48}</style>
    <rect width="300" height="234" fill="#efe4c8"/>
    <path d="M38 118 C40 50 110 22 170 26 C232 30 270 62 266 112 L262 128 L40 130 Z" fill="#e6d8b4" stroke="${wallEdge}" stroke-width="1"/>
    <path d="M38 118 C40 50 110 22 170 26 C232 30 270 62 266 112" fill="none" stroke="${wall}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M70 134 C78 184 130 206 168 204 C210 202 238 178 240 136 Z" fill="#e6d8b4" stroke="${wallEdge}" stroke-width="1"/>
    <path d="M70 136 C78 184 130 206 168 204 C210 202 238 178 240 138" fill="none" stroke="${wall}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M0 122 C60 118 100 132 150 128 C200 124 240 130 300 120 L300 140 C240 150 200 142 150 146 C100 150 60 140 0 142 Z" fill="#8fb0d6"/>
    <path d="M122 129 C135 124 162 124 176 130 C162 140 135 141 122 136 Z" fill="#e6d8b4" stroke="#6b5a48" stroke-width=".8"/>
    ${place(250, 98, 'Hôtel Saint-Pol', 'end')}
    ${place(60, 112, 'The Louvre')}
    ${place(150, 114, 'The Châtelet')}
    ${place(120, 54, "Hôtel d'Artois")}
    ${place(205, 78, 'Hôtel Barbette (the queen)', 'end')}
    ${place(150, 133, 'Notre-Dame')}
    ${place(150, 182, 'The University')}
    ${here === 'court' ? `<g transform="translate(238 118)"><path d="M0 0 l5 -10 l5 10 z" fill="#2b4a7a"/><text x="-3" y="-1" text-anchor="end" class="pm-t">you</text></g>` : `<text x="14" y="22" class="pm-t">To your estates, a long day's ride or more</text><path d="M18 30 l-8 -8 m0 0 h6 m-6 0 v6" stroke="#6b5a48" fill="none"/>`}
    <rect x="8" y="210" width="12" height="8" fill="${wall}" stroke="${wallEdge}" stroke-width=".8"/><text x="26" y="218" class="pm-l">The walls: ${control === 'bur' ? 'held by the Burgundians' : control === 'arm' ? 'held by the Armagnacs' : 'shared between the princes'}</text>
  </svg>`;
}
