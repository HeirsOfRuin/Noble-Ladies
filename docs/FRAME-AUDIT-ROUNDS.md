# Frame: the audit rounds

## The author's words
> "Start with all recommendations" (2026-11-14), after the audit in `AUDIT-2026-11.md`.

Five rounds, in the audit's order: polish, stakes, the manuscript look, release,
expansion. A commit after each, with `npm run check` clean.

## Round 1: polish (2026-11-14)
| Audit item | What changed | Where |
|---|---|---|
| 1. Outcomes never shown | "What came of it" box above the next screen: the result lines and every change to purse, standing, favour, lands, trust and his regard | `snapshot`/`changes` in `effects.js`; `outcomeBox` in `app.js` |
| 2. New game overwrote the save | Asks first; the old game is kept as a backup, restorable from the title | `app.js` |
| 3. Promised and veiled | A betrothed child cannot take the veil or go to the Church, and a child in the Church cannot be betrothed (three places checked); an invariant test over 100 games | `children.js`, `turn.js`, `effects.js` |
| 4. Empty news card | Half-year news goes in the report, never on a card | `history.js` |
| 5. Dates disagree | Half-years are "Summer" (March to August) and "Winter" (September to February), as the keys always meant; the top bar shows the card's date while a card is open; Raoul's gate no longer says June | `clock.js`, `turn.js` |
| 6. Counts in figures | "three houses have answered", "at four years old" | `words` in `effects.js` |
| 7. Difficulty hidden | Three choices on the title, described by measured survival | `app.js` |
| 8. Name "The", icon "T" | "Saint-Pol"; an illuminated S | `assets/` |
| 9. Contrast, tap size | Gold text 5.1:1 (was 2.97:1); chips, links and folds 44px | `styles.css` |
| 10. Jargon | One name per stat everywhere: Good name, What you know, House in order, The queen's favour | `effects.js`, `actions.js`, `app.js` |
| 11. Flag-only choices | Show "Remembered later" | `describeOp` |
| 12. Update banner, sim comments | Reload button survives a render; comments name this game's settings | |
| Repetition | Routine report lines cycle through 3 to 6 wordings; births, fevers, the queen's summons, Christine's letters and the captains vary; Christine asks once per real book, by year; the fever's three choices cost different things (money; a vow; her place at court) | `lines.data.js`, `events.js`, `family.js` |
| Continue taps | Minor turning points are told in the report ("Elsewhere in France"); the murder of Orléans, the Cabochiens, Agincourt and Troyes ask how she answers. Troyes reaches the epitaph | `history.data.js`, `history.js` |
| B. How this life was made | The ending sets history's turning points beside her own choices, act by act; "Copy her chronicle" | `lifeMade` in `ending.js` |
| D. First-time hints | One per screen (plan, card, House, People, News), gone once the thing is done | `app.js` |
| Found on the way | Act 1 sources could report the same thing twice about one man | `act1.js` |

Measured (50 runs per policy): taps per run 98-102 down to 88-96; every test,
the bot batch, the bundle check and the phone smoke clean.

## Round 2: stakes (2026-11-14)
| Audit item | What changed | Where |
|---|---|---|
| 2.1 Playing safe wins | A new score part, **Standing at court** (15): half-years an office was held and paid, a place among the queen's ladies, pensions still paid, children placed as pages or in the queen's household, the queen's ear. Wealth now counts 10 (was 15) and stops counting at about 4,000 livres; children 20 (was 25); good name 15 (was 20) | `courtStanding`, `score` in `derive.js` |
| 2.2 The plan is solved | Going through the accounts two half-years running finds 40% as much; a rumour that is not traced costs the rival her seat beside the queen (the queen's favour +3) | `actions.data.js`, `actions.js`, `turn.js` |
| 2.5 Act 4 goes flat | From 1420 English soldiers are billeted on every house, at court or at home: pay, take them in, or (with Burgundian friends) write for an exemption. Troyes asks for the oath (round 1) | `billeted` in `events.js` |
| 2.6 News worth nothing | New action: **lodge your plate and coin with the Lombards**, open only while a warning is live; it halves the fine if Paris changes hands within two half-years | `secure` |
| 2.7 Endings converge | Thresholds from the measured spread: "rose" 85+, "held" 65+, "diminished" 45+ (were 75/55/35, so 60% of games "rose"). Six new epitaph sentences: the Troyes oath (3 ways), the queen's lady, years in the king's household, Christine's books, letters opened, plate with the Lombards | `ending.js` |
| Home runs read as Paris | The Châtelet scene says when she is on her estates | `arcs.data.js` |

### Measured (400 runs per policy)
| Policy | Survived | Score before | Score now |
|---|---|---|---|
| loyal_bur | 85% | 80 | 83 |
| deaf | 85% | 80 | 81 |
| burgundy | 69% | 72 | 80 |
| christine | 83% | 74.5-76.5 | 79 |
| loyal_arm | 85% | 76-78 | 78 |
| courtier | 57% | 63-66 | 73.5 |
| **homebody** | 95% | **83** | **73** |
| seasonal | 88% | 70 | 72 |
| random | 60% | 41 | 40 |

Staying home is now the safe, modest life: it almost never dies (95%) and
ends with the most money (8,000 livres), but scores below every committed
strategy. Committing to a party pays most; the court is risky (57% survive) and
now worth it.

**News (K2):** reading warnings now protects the house (150 games: fines 688
livres a game against 1,596 for the bot that ignores news; the plate goes to the
Lombards about twice a game). The score is still even (christine 79, deaf 81),
because the bot that reads news leaves Paris on every credible warning and loses
court standing doing it. That is the trade-off the K2 fix chose: news protects
the house at the price of position. A player who reads sources better than the
bot should come out ahead; the author's playtest decides.

## Round 3: the manuscript look (2026-11-14)
| Audit item | What changed | Where |
|---|---|---|
| A. Ornament | The title page opens on a miniature: the Hôtel Saint-Pol on the Seine in a gold quatrefoil, a lady in red at a window. Acts open with a gilt rule and a gilded initial; turning points carry a gilt rule. All SVG strings, no image files (after Knight of Adalia's Illumination) | `src/ui/art.js` |
| C. A running chronicle | A sixth tab, **Years**: her life a year at a time, newest first, built only from the save (turning points, where she spent each half-year, each story choice under its storyline's name, births, deaths) | `src/engine/chronicle.js` |
| E. Heraldry | Arms for every invented house, generated from the house's name, so the same house always bears the same arms (no save change), with the rule of tincture kept. Her own shield is her husband's arms impaling her father's, as a married woman's were. Shown on the House tab, beside her husband, and beside each child's betrothed house. Real princes are not drawn. Checked on a contact sheet: one roundel sat on a bend and vanished, fixed | `src/engine/heraldry.js` |
| H. Sound | Made in code (after The Lists): two strokes of a parish bell when a half-year ends, a small chime on a choice, a low knell for a death or a turning point. On by default, a switch in Menu, remembered | `src/ui/sound.js` |
| Found on the way | The same debt listed twice now says "twice"; the bundler does not follow `export ... from` (the Years tab threw until the import was made plain; the phone smoke now visits Years) | `turn.js`, `tools/smoke.mjs` |
