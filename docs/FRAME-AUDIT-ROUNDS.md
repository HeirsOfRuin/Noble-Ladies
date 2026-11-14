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
