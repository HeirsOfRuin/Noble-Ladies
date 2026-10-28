# The Lady of Saint-Pol: one-page spec

A noblewoman at the court of the mad King Charles VI, 1400 to 1422.

Status: **Stage 1 spec, 2026-10-28**, condensed from the author's design brief
(`docs/BRIEF.md`). Kill gate run the same day: `docs/KILLGATE.md`. Where the
brief and this page differ, this page records the decision and why.

---

## 1. Setting
Paris and the Île-de-France, 1400 to 1422: the madness of Charles VI, the feud
between Orléans and Burgundy, the civil war, Agincourt, the Treaty of Troyes.
She is an invented lady of a middling house (Brécourt): big enough to matter,
small enough to be crushed. Real figures surround her; history's turning points
are fixed.

## 2. Pillars
1. **Indirect power.** She acts through people: patrons' households, her
   steward, her chamberwoman, her confessor, her procureur, her husband. Each has
   a reliability and a loyalty, learned by using them.
2. **Late consequences.** A choice in one act can come due in the next.
3. **Unreliable information.** Warnings come before each swing, mixed with false
   ones that look the same.
4. **No modern romance.** Marriages are contracts. Courtly love is a literary game.
5. **Mortality handled soberly.** Childbed, fever and the 1418 epidemic are risks
   she manages (health, where she lies in, her household), never a surprise.
6. **Events from systems.** Only the turning points and act transitions are
   written by hand.
7. **Write from the sources.** Christine de Pizan's *Treasure of the City of
   Ladies* (1405) is a valid strategy, not always the best one.

## 3. Core loop (one turn = half a year, Acts 2 to 4)
1. Choose where: **court** (3 actions, costly, news and favour, danger if Paris
   turns) or **the estates** (2 actions, full rents, rest, safety, favour fades).
2. Choose 2 or 3 actions; most go through an intermediary.
3. Resolve: actions, delayed results now due, rents and costs, drift, the family,
   the historical clock, news, at most one systemic event.
4. Answer the cards that came out of it.

Act 1 is seven scenes in 1400 (the tutorial): one lesson each, taught by a choice.

## 4. The scarce resource
**Standing that cannot be spent directly**: favour with each side, other people's
trust, and her good name. Money buys access to those, never outcomes. The
earlier games made money, capacity, fear or fame scarce. This one makes
leverage over other people scarce.

## 5. The per-turn decision
Court or country. Court pays in favour, pensions, news and better matches for
her children, and costs money, health and exposure when Paris changes hands. The
estates pay in rents, rest and safety, and cost her place: favour fades, news
comes late, her name drifts back to the provinces'. Inside that, she decides
whom to trust with what.

## 6. The ways to lose
- **Death**: childbed, fever, the 1418 epidemic, the 1418 massacre (if in Paris).
- **Ruin**: debts past 4,500 livres; creditors take the house.
- **Diminishment**: she lives to 1422 but the house has lost lands, the children
  are unplaced, the name is gone. The score says so.

## 7. The one way to win
Be alive in October 1422 with the house standing. The legacy score (lands 25,
children and their matches 30, good name 20, wealth 15, her own fate 10) and a
chronicle epitaph grade how well. The same rule for every start.

## 8. Starts, difficulties, backgrounds
- One fixed family background (Brécourt) for the first version (open question 2).
- Two suitors drawn per game from four, with different party leanings; traits
  jittered by the seed. The contract decides her husband, dowry and dower clause.
- Difficulty: Gentle / As it was / Hard (costs and dangers x0.85 / 1 / 1.15-1.3).
  Measured: survival 90.5% / 84% / 78.5% (adaptive bot, 200 runs each).

## 9. What carries over from earlier games
- Engine shape, ledger, saves, smoke test, Pages: game-scaffold shape B
  (Centennial Farm, The Lists).
- "At stake" lines computed from a choice's real effects (Knight of Adalia).
- Named RNG streams; a value drawn once and stored (Touchline).
- A kill gate before content (The Company).

## 10. Open questions for the author
| # | Question | Default taken |
|---|---|---|
| 1 | Working title | "The Lady of Saint-Pol" kept |
| 2 | One family background, or a choice of two or three? | One (Brécourt) for v1 |
| 3 | Does her death end the game? | Yes (brief's recommendation): this is her life |
| 4 | Art direction | Text only, styled as a manuscript (rubrics, drop capitals, gold rules) |
| 5 | Can she change real figures' fates? | No: turning points are fixed |
| 6 | Should faction swings hurt more? (kill gate finding K3) | Kept moderate; decide after a playtest |
| 7 | Is "stay on the estates" being the safest median strategy right? (K1) | Kept: safe floor vs a court ceiling. Decide after a playtest |

---

## Decisions log
Newest first. Quote the author; give the numbers with their run counts.

| Date | Decision |
|---|---|
| 2026-10-28 | **Her age.** The author: "the characters age at the start will be 17, and marry at 18." The brief had her about 14 in 1400. Now born January 1383: seventeen through Act 1 (1400), married in April 1401 at eighteen. Asserted in `test/invariants.test.js` (every Act 1 scene shows 17, the wedding card says "at eighteen", no Act 1 text names a younger age). Childbirth stays off-screen and is handled as a risk, never described. Her children's marriages are betrothal contracts from age 14, the wedding deferred "until the child is grown"; nothing more is shown. |
| 2026-10-28 | **Dower rule checked** (brief 6.6 asked for it). Customary dower was the widow's life use of half the lands her husband held at the marriage (Beaumanoir's general custom; the later written custom of Paris says the same). The 1400 Paris practice is inferred from those two, not read from a Paris text of the period. Mechanic: widowed without a son, half the lands go to his kin; with a son she governs all as guardian; a dower not assigned on named lands in the contract can be contested in the Parlement. |
| 2026-10-28 | Spec drafted from the brief; kill gate run (`KILLGATE.md`). |
