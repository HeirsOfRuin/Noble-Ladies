// A whole game as a player reads it, written to Markdown:
//   node tools/transcript.mjs [policy] [seed] > docs/playthroughs/<policy>-<seed>.md
// Plus a pacing summary on stderr: cards per half-year, quiet half-years, and the
// gap before each storyline comes back. Built for the "does it feel choppy?" question.

import { newGame, advance, view } from '../src/engine/turn.js';
import { decide } from '../sim/bot.js';
import { BEATS, TOUCHES, ARCS } from '../src/data/arcs.data.js';

const policy = process.argv[2] || 'christine', seed = Number(process.argv[3] || 3);
let s = newGame({ seed, name: 'Marguerite' });
const out = [`# ${policy}, seed ${seed}\n`];
const perHalf = new Map(); // turn -> { story, other }
const lastSeen = {}; const gaps = [];
const arcOf = Object.fromEntries([...BEATS, ...TOUCHES].map((b) => [b.id, b.arc]));
while (!s.over) {
  const v = view(s);
  const inp = decide(s, policy);
  if (v.phase === 'scene') out.push(`## ${v.scene.when}: ${v.scene.lesson}\n\n> ${v.scene.governess}\n\n${v.scene.text}\n\n**Chose:** ${v.scene.choices[inp.choice].label}\n`);
  else if (v.phase === 'card') {
    const c = v.card, raw = s.cards[0];
    const turn = s.turn - 1;
    const k = perHalf.get(turn) || { story: 0, other: 0, ids: [] };
    if (raw.beat) { k.story++; const a = arcOf[raw.beat]; if (lastSeen[a] !== undefined) gaps.push({ arc: a, gap: turn - lastSeen[a] }); lastSeen[a] = turn; } else k.other++;
    k.ids.push(raw.beat || raw.id); perHalf.set(turn, k);
    out.push(`### ${c.when || ''} · ${c.title}${c.arc ? ` (${c.arc})` : ''}\n\n${c.recall ? `*${c.recall}*\n\n` : ''}${c.text}\n${c.lines.length ? `\n${c.lines.map((l) => `- ${l}`).join('\n')}\n` : ''}\n**Chose:** ${c.choices[inp.choice].label}\n`);
  } else if (v.phase === 'plan' && inp.type === 'plan') {
    out.push(`---\n## ${v.date} · ${inp.place === 'court' ? 'at court' : 'on the estates'}\n\nActions: ${inp.actions.map((a) => a.id + (a.target ? ` (${a.target})` : '')).join(', ') || 'none'}\n`);
  }
  s = advance(s, inp).state;
  if (v.phase === 'plan' && inp.type === 'plan') { const r = s.history.at(-1); if (r.lines.length) out.push(r.lines.map((l) => `- ${l}`).join('\n') + '\n'); }
}
out.push(`\n## The end\n\n${s.ending.epitaph}\n\n${s.ending.lastWords || ''}\n`);
console.log(out.join('\n'));

const halves = [...Array(44).keys()].map((i) => perHalf.get(8 + i) || { story: 0, other: 0, ids: [] });
const counts = halves.map((h) => h.story + h.other);
const quiet = halves.filter((h) => h.story === 0).length;
const big = halves.map((h, i) => [8 + i, h]).filter(([, h]) => h.story + h.other >= 4);
const byArc = {};
for (const g of gaps) (byArc[g.arc] ||= []).push(g.gap);
console.error(`cards per half-year: mean ${(counts.reduce((a, b) => a + b, 0) / 44).toFixed(1)}, max ${Math.max(...counts)}; half-years with no story beat: ${quiet} of 44`);
console.error(`half-years with 4+ cards: ${big.map(([t, h]) => `${t}[${h.ids.join(',')}]`).join(' ')}`);
console.error('gap before a storyline returns (half-years): ' + Object.entries(byArc).map(([a, g]) => `${ARCS[a].title} ${g.join('/')}`).join('; '));
