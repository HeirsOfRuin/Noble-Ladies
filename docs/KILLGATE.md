# Kill gate: The Lady of Saint-Pol

Stage 2 of the workflow, run 2026-10-28. Instead of a separate numbers-only
prototype, the kill gate ran on the real engine with no UI (shape B runs it
headless), so the harness cannot drift from the game (The Company's lesson:
"two models drift"). Fixed policies x seeds, through `sim/run.js` and the
policies in `sim/bot.js`.

Gate: strategies differ measurably; surviving to 1422 with a good house is
reachable but not trivial; no strategy trivially dominant; information changes
outcomes.

## The policies
| Policy | Plays |
|---|---|
| courtier | Always at court: the queen, petitions, the Court of Love |
| homebody | Always on the estates: accounts, tenants, children, rest |
| orleans / burgundy | Always at court, all in on one party (reckless partisan) |
| hedger | Always at court, gifts to both parties |
| christine | Adaptive, after the *Treasure*: court when the purse and health allow, estates when not or when warned; neutral patrons; counsels her husband to stay out of the armies; assigns the dower |
| deaf | christine, ignoring all news (the value of information) |
| loyal_arm / loyal_bur | christine's discipline, all in on one party (sensible partisan) |
| seasonal | Court every spring, estates every autumn |
| random | Any allowed choice |

## What the first runs found (all fixed before the UI was built)
| # | Found | Cause | Fix |
|---|---|---|---|
| 1 | Every always-at-court policy died by about 1407 (100%, 200 runs) | Health only wore down at court; three childbeds took her from 80 to 7 | Health drifts toward 45 at court, 90 on the estates; only grave causes can kill |
| 2 | Small knocks killed (a summer at Vincennes, -4 health, at health 3) | Any health loss could reach zero | Only fever (marked grave), childbed, the 1418 epidemic and the 1418 massacre can kill |
| 3 | 54% of courtiers died in the 1413 Cabochien rising | Every swing could kill | The Cabochiens imprisoned the queen's ladies; they did not massacre them. Only 1418 kills; earlier risings cost health and the price of getting out of the Châtelet |
| 4 | Homebody: 90% survival, 14,000 livres median | Rents far above costs | Rents 55 to 42 per holding, estates cost up, court cost down |
| 5 | Reputation saturated (random play: 94/100) | Gains did not slow | Gains shrink as the name grows (full below 30, a quarter at 90); losses taken in full; a name above 45 fades on the estates |
| 6 | The bot declined 95% of marriage offers | **Bot**, not design: it priced a daughter's dowry in livres against a match | Bot values a placed child properly; houses turned down do not write again for two years |
| 7 | Court policies went bankrupt even playing sensibly (seasonal: 27% ruined) | Court costs above what a half-year at home earns back | Court 380 to 300 a half-year, husband's spending 45 to 35 per point; pensions raised |
| 8 | News was worth nothing (christine = deaf) | Swing penalties hit the same at home or in Paris | Away from Paris at a swing, fines and confiscation x0.55; swings x1.6 harsher |
| 9 | Charles of Orléans offered as a patron in 1404 | Arrival dates read from the save, not the cast table | Fixed; test asserts no figure is offered before arriving or after leaving |

## Results as built (400 runs per policy, normal difficulty)
| Policy | Survived | Died | Ruined | Score median [p10–p90] | Children placed |
|---|---|---|---|---|---|
| homebody | 94.3% | 5.8% | 0.0% | 71.5 [55–82] | 2 |
| christine | 85.0% | 15.0% | 0.0% | 68.5 [49–87] | 1 |
| deaf | 87.0% | 12.8% | 0.3% | 68.0 [49–90] | 1 |
| loyal_bur | 86.8% | 13.0% | 0.3% | 63.0 [45–78] | 1 |
| seasonal | 84.0% | 10.3% | 5.8% | 60.0 [45–80] | 1 |
| loyal_arm | 72.8% | 11.0% | 16.3% | 54.0 [41–76] | 1 |
| hedger | 32.8% | 30.5% | 36.8% | 47.0 [37–63] | 0 |
| burgundy | 48.0% | 30.5% | 21.5% | 46.0 [38–69] | 0 |
| courtier | 39.0% | 33.0% | 28.0% | 46.0 [35–69] | 0 |
| random | 55.8% | 12.5% | 31.8% | 46.0 [40–55] | 0 |
| orleans | 20.5% | 34.5% | 45.0% | 44.0 [35–56] | 0 |

Rates ±1 SE are about ±2.4 points at these sizes. Difficulty (christine, 200
runs): survival 90.5% / 84.0% / 78.5%, median score 72.5 / 67 / 59.

## Against the gate
- **Strategies differ measurably: yes.** Survival ranges from 20% to 94%, median
  score from 44 to 72.
- **Reachable, not trivial: yes.** Careful play survives about 85% of the time;
  reckless court play survives 20 to 50%.
- **The Burgundian bet pays and the Orléans bet does not**, as in history: loyal_bur
  63 vs loyal_arm 54, ruin 0.3% vs 16%. Orléans loyalists are fined and confiscated
  in 1407 and 1418 and lose pensions when Paris turns.
- **Runs end differently: yes.** The p10 to p90 spread of every adaptive policy is 30+ points.

## Open findings (for the author)
- **K1. Staying home is the safest median.** Homebody has the best median (71.5)
  but a lower ceiling (p90 82) than christine (87) or deaf (90). Court is the
  gamble with the higher top. Defensible, but a player who works this out may
  sit at home for 22 years, which is a boring game. Levers if a playtest agrees:
  children's matches gated harder on court favour; a provincial name capped lower;
  an Act 4 event that only court friends can turn aside (the Treaty of Troyes
  oath). Not changed without the author.
- **K2. Information is worth little.** loyal_bur 63 vs loyal_bur+deaf 61 (400 runs
  each, gap about 1.5 SE); christine vs deaf, no difference. The warned bot is
  home for 83% of the 1413 swings against 61% when deaf, so the warnings arrive and
  are acted on; the swings are not costly enough for it to show in the score, and
  false warnings pull her away from court for nothing. Either swings hurt more
  (`CONFIG.swingSeverity`), or the response to a warning has to be richer than
  "go home". Brief rule 3 is not yet earning its keep.
- **K3. Hedging is a trap as played.** The hedger never goes home and pays twice.
  A sensible hedger policy has not been written; until it has, "hedging is
  possible" (brief 6.7) is untested.
- **K4. Mortality.** Careful play dies 10 to 15% of the time before 1422, mostly in
  childbed and the 1418 epidemic. Plausible for the period; the author should
  say whether it feels fair.
