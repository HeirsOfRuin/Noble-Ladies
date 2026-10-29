# The Lady of Saint-Pol: design

Phase 0 proposal and the first build, together. Inputs: `BRIEF.md` (the
author's brief), `SPEC.md` (the one page, with decisions), `KILLGATE.md`
(measurements). Where an "as built" section differs from the plan, it wins.

---

## 1. Decisions already made
| Decision | Source |
|---|---|
| Phone first, installable, offline, no accounts, turn-based | All previous builds |
| Shape B: vanilla ES modules, no build step, bundled to one file | Systems game; events generated from state, only turning points hand-written (brief rule 6) |
| She is 17 in Act 1, married at 18 | The author, 2026-10-28 |
| Her death ends the game; history's turning points are fixed | Brief open questions 3 and 5 (recommended answers taken) |
| Text only, styled as a manuscript | Brief open question 4 |
| One family background in v1 | Brief open question 2; fewer gates to measure |

## 2. Stack
| Choice | Decision | Why |
|---|---|---|
| Shape | Vanilla ES modules, bundled to one file by `tools/bundle.js` | The engine runs headless in Node for the bot and the kill gate |
| Saves | Guarded localStorage, key `the-lady-of-saint-pol.save.v1` (never rename), `v` + migrations, text code `LSP1.` | Every past build's contract |
| Tests | `npm run check`: invariants, save contract, 50-game bot batch, bundle, bundle check, phone smoke | |
| Deploy | GitHub Pages from the default branch by Actions; itch zip later (game-release) | |
| Dependencies | None at runtime; Playwright from the environment for the smoke | |

## 3. Architecture
```
src/data/            logic-free tables
  config.data.js       every tuning number, with what it means
  history.data.js      the clock: who holds Paris, swings, turning points, acts
  cast.data.js         real figures (with exits) and the invented household; suitors
  actions.data.js      the actions: cost, place, intermediary, delay
  act1.data.js         the seven contract scenes and their late consequences
src/engine/          pure: (state, input) -> state; no DOM, no Date, no Math.random
  clock.js             turn -> date, act, control of Paris, her age
  state.js             newGame, save contract, migrations, save codes
  effects.js           declarative ops: applies and describes ("At stake")
  derive.js            every number the UI shows (previews, odds, exposure, score)
  ledger.js            the only place money moves; purse == ledger
  act1.js              the contract scenes and the wedding
  actions.js           her actions, through their intermediaries; delayed results
  news.js              warnings and false rumours; claims vs hidden truth
  family.js            births, children, the husband, Agincourt, widowhood, matches
  history.js           turning points, swings, exits, the epidemic, act cards
  events.js            systemic events, built from state; queued cards
  ending.js            score and epitaph
  turn.js              the facade: newGame, advance, view, houseView, peopleView, newsView
src/ui/              reads the engine, computes nothing
sim/                 bot (10 policies), adapter, game-measure kit
test/                invariants (10), save contract (5), v1 fixture (Act 3)
tools/               bundle, checks, smoke (adapted), icons, stamp
```
Import direction: `ui → engine → data`.

### The turn (src/engine/turn.js)
Inputs by phase: `scene` (Act 1), `plan` (place + actions with targets), `card`
(an event or turning point), `counsel` (advice to her husband, no time passes).
A half-year resolves in written order: actions, delayed results due, rents and
costs, drift, family, the historical clock, news, at most one event, death and
ruin checks. The report is read off the ledger.

### Indirect power, concretely
| Action | Goes through | What can go wrong |
|---|---|---|
| Petition for a pension | The patron's household | Refused; answer delayed a half-year (patron's reliability); patron dies first |
| Send a gift | Perrette, the chamberwoman | Delivered late and badly (half effect) |
| Gather gossip | Perrette or Ysabel | Brings false rumours; talks about your questions |
| Spread a rumour | Perrette | Traced to you (her loyalty) |
| Go through the accounts | The steward | Without it, an absent lady's steward skims (his honesty) |
| Write a letter | A messenger | Arrives next half-year; your husband may ignore your counsel |
| Press a case | The procureur | Slow; judgment can go against you |
| Negotiate a match | Your mother | Houses answer only a house with a name and friends |
Reliability is shown as "untried" until she has used someone twice.

## 4. Screens
| Screen | What it does |
|---|---|
| Title | New game, continue, load a code; storage warning if the browser keeps nothing |
| Play: scene | Act 1: the governess's advice, the scene, reports from her sources, choices with stakes |
| Play: card | A turning point, an event or a late consequence; consequences listed; choices with stakes |
| Play: plan | Court or estates (net income shown), up to 2-3 actions with cost, go-between and reliability; warnings heard; why anything is closed |
| Play: end | Legacy table and the chronicle's epitaph |
| House | Her standing, exposure if Paris changed hands, husband and counsel, children and their risks, pensions, lawsuit, legacy so far, ledger |
| People | Everyone, with trust, need, reliability, party, fate |
| News | Every rumour, who said it, and whether it came true |
| Menu | Save codes, how it works |

## 5. Visual identity
Vellum `#f3ead6`, iron-gall ink `#2a1f17`, rubric red `#8f1d24`, gold `#a8823a`,
a second illuminator's blue `#2b4a7a`. System serif (Palatino, Iowan, Georgia):
no web font, so it works offline from the first load. Drop capitals on prose,
small-caps rubrics, double gold rules. Nothing like the earlier games' palettes.
Art (if any) later: an illuminated-manuscript style is cheap to fake with borders
and initials.

## 6. Instruments
| Tool | Question | Asserts |
|---|---|---|
| `test/invariants.test.js` | What can never be true? | Ages 17/18; purse == ledger; bounds; every game ends with an ending and the clock never stalls 12 inputs; determinism; the dead stay dead; every turning point on the calendar; the engine refuses what the view refuses and accepts what it offers |
| `test/save-contract.test.js` | Does every old save load and play on? | v1 fixture (Act 3, mid-game) loads and plays on; codes round-trip |
| `sim/run.js --by=policy` | What do N games look like per strategy? | Refuses runs that did not reach an ending |
| `sim/run.js --policy=X+deaf` | What is information worth to X? | Same policy, news ignored |
| `sim/run.js --trace --seed=N --policy=X` | One game, half-year by half-year | |
| `tools/smoke.mjs` | Does the real page work at 390px? | 14 turns through the UI (scenes, cards, plans), tabs, no overflow, no raw tokens, reload keeps the save |

## 7. Build plan
| Phase | Delivers | Exit | State |
|---|---|---|---|
| 1 | Engine, all four acts at bare-bones scope, bot, kill gate, placeholder-free UI | Bot plays 400 games a policy with no stalls; smoke clean | **Done 2026-10-28** |
| 2 | Calibration: the author plays Act 1 and two years of Act 2 | Verdict on voice, density, option count | Next |
| 3 | Answer K1 to K3 (`KILLGATE.md`) with the author | Every option best somewhere; information worth measurable points | |
| 4 | Vertical slice: Act 2 at full depth (more events, the Cour amoureuse, the *Rose* debate) | The author wants to play Act 3 | |
| 5 | Acts 3 and 4 at depth; English occupation; a second lawsuit; book commissions | | |
| 6 | Release: Pages link, itch zip, press art | Played from the uploaded zip | |

## 8. Economy (livres tournois, per half-year)
| Item | Amount |
|---|---|
| Rent per holding | 42 (x0.85 at court, x0.7-1.0 by household) |
| Holdings | 9 to 13 by husband |
| Court / estates upkeep | 300 / 230 |
| Husband's spending | 35 x his trait (1-5) |
| Pension | 130 to 180 |
| Dowry received | 1,600 to 2,400 (+300 to +600 by negotiation) |
| Daughter's dowry given / son's bride brings | 900 / 500 per rank of the house (1-3) |
| Ransom after Agincourt | 1,500 + 250 per holding |
| Ruin | Debt past 4,500; interest 5% a half-year |
Game-scaled, not a price series. A middling house's income of a few hundred to a
couple of thousand livres a year is the anchor.

---

## Decisions log
Newest first.

| Date | Decision |
|---|---|
| 2026-10-29 | **Depth: her, her people, her story** (`FRAME-DEPTH.md`). The author, after the first playtest: "It feels good, looks good but needs more depth. I need to feel more investment in the character, who she interacts with, and to have more behind the narrative overall plot." Built: her name, character and want; 25 story beats in five threads (the Brécourt inheritance spine, her husband, Ysabel, Jacqueline, the queen's offer); margin pages in her voice; an epitaph that names her story. New engine: `cond.js`, `arcs.js`, `reflect.js`; save v2 with migration. Measured: every beat fires; loyal_bur 63 -> 75, loyal_arm 54 -> 71, homebody 71.5 -> 71 (400 runs each). Christine's, the queen's and the children's arcs wait for the author's verdict on this round's voice. |
| 2026-10-28 | **Phase 1 built.** All four acts at the brief's bare-bones scope: 7 Act 1 scenes, 44 half-years, 21 turning points, 6 faction swings, 13 cast, 17 actions, 9 systemic events, Agincourt fate roll, widowhood with dower, children's betrothals, legacy score and epitaph. Kill gate: 400 runs x 11 policies (`KILLGATE.md`). Nine faults found and fixed before the UI; four open findings for the author. Tests 15/15, smoke clean at 390px (4 runs). |
| 2026-10-28 | **Her age**: 17 in Act 1, married at 18 (the author). See `SPEC.md`. |
