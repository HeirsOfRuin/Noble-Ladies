// Writes docs/itch/cover.html from the game's own art (src/ui/art.js), so the store cover
// cannot drift from the title page. Run: node tools/make-cover.mjs, then node tools/press.mjs.
import { artDefs, miniature, giltRule } from '../src/ui/art.js';
import { impaledSvg } from '../src/engine/heraldry.js';
import { writeFileSync } from 'node:fs';
const html = `<!doctype html>
<!-- docs/itch/cover.html: the 630x500 cover, rendered by tools/press.mjs at 2x.
     The miniature and rule are the game's own (src/ui/art.js miniature(), giltRule()),
     written by tools/make-cover.mjs, so the store art cannot drift from the title page.
     Edit that tool, not this file. -->
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: 630px; height: 500px; overflow: hidden; }
  body { background: radial-gradient(ellipse at 50% 40%, #8e2a35 0%, #3d0f15 75%); color: #f6efdd; font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif; position: relative; }
  .frame { position: absolute; inset: 12px; border: 3px double #c99a2e; border-radius: 3px; }
  .art { position: absolute; left: 40px; top: 70px; }
  .text { position: absolute; left: 326px; right: 34px; top: 92px; }
  .kicker { font-variant: small-caps; letter-spacing: .12em; color: #e8c66a; font-size: 20px; margin: 0 0 10px; }
  h1 { font-size: 46px; line-height: 1.02; margin: 0 0 14px; font-weight: 700; text-shadow: 0 2px 0 #0007; }
  .tag { font-style: italic; font-size: 17px; line-height: 1.35; color: #eadfc6; margin: 0; }
  .rule { width: 220px; margin: 16px 0; }
  .foot { position: absolute; bottom: 30px; width: 100%; text-align: center; font: 700 13px system-ui, sans-serif; letter-spacing: .3em; text-transform: uppercase; color: #cfc3a6; }
</style></head><body>
  ${artDefs()}
  <div class="frame"></div>
  <div class="art">${miniature(260)}</div>
  <div class="text">
    <p class="kicker">Paris, 1400 to 1422</p>
    <h1>The Lady of Saint&#8209;Pol</h1>
    <div class="rule">${giltRule()}</div>
    <p class="tag">A noblewoman at the court of the mad King Charles VI. She cannot command. She can persuade, write, wait, and choose whom to trust.</p>
  </div>
  <div class="foot">Turn-based · Text · Phone or browser · Free</div>
</body></html>
`;
writeFileSync('docs/itch/cover.html', html);
