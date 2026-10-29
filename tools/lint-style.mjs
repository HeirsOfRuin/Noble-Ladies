// Style lint: node tools/lint-style.mjs
//
// Reads the banned lists from docs/STYLE.md (the guide owns the lists; Knight of
// Adalia's lint-style works the same way) and checks every string the player
// can read: the data tables, and the text in the engine and UI. Comments are
// skipped. Exits 1 on any hit, naming the file, the line and the word.

import { readFileSync, readdirSync } from 'node:fs';

const guide = readFileSync('docs/STYLE.md', 'utf8');
const banned = [];
let section = null;
for (const line of guide.split('\n')) {
  const h = line.match(/^## Banned: (.+)$/);
  if (h) { section = h[1]; continue; }
  if (line.startsWith('## ')) { section = null; continue; }
  const item = line.match(/^- (.+)$/);
  if (section && item) banned.push({ word: item[1].trim(), section });
}
if (banned.length < 10) { console.error('lint-style: found almost no banned words in docs/STYLE.md; is the guide intact?'); process.exit(1); }

const files = [
  ...readdirSync('src/data').filter((f) => f.endsWith('.js')).map((f) => `src/data/${f}`),
  ...readdirSync('src/engine').filter((f) => f.endsWith('.js')).map((f) => `src/engine/${f}`),
  'src/ui/app.js',
];

// Player-visible text: the contents of string literals, with comments removed.
function strings(src) {
  const out = [];
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    const code = line.replace(/^\s*\/\/.*$/, '').replace(/^\s*\*.*$/, '').replace(/\s\/\/\s.*$/, '');
    const re = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
    let m;
    while ((m = re.exec(code))) out.push({ text: m[1] ?? m[2] ?? m[3], line: i + 1 });
  });
  return out;
}

const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const tests = banned.map((b) => ({ ...b, re: new RegExp(`(^|[^\\p{L}])${esc(b.word)}($|[^\\p{L}])`, 'iu') }));

let hits = 0;
for (const f of files) {
  for (const { text, line } of strings(readFileSync(f, 'utf8'))) {
    for (const t of tests) {
      if (t.re.test(text)) { hits++; console.log(`${f}:${line}  ${t.section}: "${t.word}"  in: ${text.slice(0, 90)}`); }
    }
  }
}
console.log(hits ? `\n${hits} style hit(s). See docs/STYLE.md.` : `style lint clean (${banned.length} banned words, ${files.length} files)`);
process.exit(hits ? 1 : 0);
