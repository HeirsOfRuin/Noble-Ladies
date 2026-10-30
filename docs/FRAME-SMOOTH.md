# Frame: smoothing the story

## The author's words
> "Make sure the story doesn't feel too choppy" (2026-10-30)

## Diagnosis (before)
Measured with `tools/transcript.mjs` (a full playthrough written as Markdown, pacing
stats on stderr) over four games: christine seed 3, loyal_bur 5, seasonal 7,
courtier 9.

- **Long silences.** A storyline could vanish for 19 to 22 half-years (ten years of
  play) and come back as if the player remembered it.
- **Empty half-years.** 14 to 16 of the 44 half-years had no story at all: only
  the accounts.
- **Stacks and whiplash.** Up to five cards in one half-year. A light scene could
  land on the same page as the murder of Orléans.
- **The report read as a list.** It showed stat lines, not what she did.

## What changed
| Change | Where | The failure it fixes |
|---|---|---|
| 13 short keeping-in-touch scenes (Ysabel, Christine, the queen, Jacqueline, the husband, Raoul) that fire only in a half-year with no story beat, from the storyline quiet longest | `TOUCHES` in `arcs.data.js`, `touchTurn` in `arcs.js` | Long silences, empty half-years |
| A touch on the last half-year of its window may sit beside a single beat | `arcsTurn` | The crowded years 1403-07 left no empty half-year, so two scenes never fired |
| No touch on a turning point that moves Paris, or at the end of an act | `touchTurn` | Tonal whiplash |
| Background events back off when the story already fills the page (none at a swing; 30% chance beside one beat, none beside two) | `eventsTurn` | Stacks |
| Cards in a fixed order: history and news, then her story, then household, then her margin, then the act's close | `orderCards` in `turn.js` | Scenes read out of sequence |
| "The last time, in the spring of 1406: ..." above a returning storyline after two years away, from a memo every choice now leaves | `recallLine`, `MEMOS`, `s.story` | Coming back cold |
| "Between you" in People and House: the story so far with each person | `storyOf` | No place to look it up |
| The half-year report opens in prose ("You spent the autumn at court, in Paris"); figures in a small line; accounts folded | `report()` in `app.js` | List-like report |
| Raoul sends her husband's half of a ransom under the brotherhood contract (1411-15) | `t_raoul_share` | The husband's honour went quiet 1409-1418 |

Save version 5 adds `story` (with a migration and a fixture).

## Measured (after)
| | Before | After |
|---|---|---|
| Half-years with no story (of 44) | 14-16 | 7-9 |
| Longest gap in a storyline (half-years) | 19-22 | 13 (the queen for a Burgundian loyalist; the husband's honour for a courtier) |
| Cards per half-year | mean ~2.0, max 5 | mean 2.1-2.4, max 4-5 |
| Every beat and touch fires (11 policies x 30 seeds) | yes | yes |

Playtime estimate unchanged: about 101-104 minutes for a careful run (150 runs per
policy). Balance (median score, 150 runs): homebody 83, loyal_bur 78, deaf 77.5,
loyal_arm 76, christine 74.5, burgundy 73, seasonal 70, courtier 63. Homebody's
rise (72 to 83) is inside this run's noise (~11 points at 150 runs). It needs a
larger batch before anything changes.

## Left as it is
- Seven to nine quiet half-years remain on purpose: the estates in a quiet year
  should feel quiet.
- The queen's thread is thin for a Burgundian loyalist (one beat in 13 half-years),
  because a lady who serves Burgundy has little reason to see the queen.
