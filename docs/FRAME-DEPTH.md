# Frame: depth (her, her people, her story)

## The author's words
> "It feels good, looks good but needs more depth. I need to feel more investment
> in the character, who she interacts with, and to have more behind the
> narrative overall plot." (first playtest, 2026-10-29)

## The problem
Classification: **design gap**, not a bug. Three gaps:
1. **She is a blank.** No name of the player's choosing, no character that forms
   from choices, nothing she wants. The player manages a house, not a person.
2. **People are numbers.** Ysabel, Jacqueline, her husband, her mother each have a
   trust bar and at most one event. Nobody has a story that remembers what she did.
3. **She has no plot.** History moves around her (21 turning points) but nothing
   personal runs from the contract to 1422. The acts end on history's events, not hers.

## The design rule
**One personal spine, four people with stories, and a woman with a character and
a want, all woven into the fixed history.** History stays the board; her story is
what the player cares about on it. Every beat remembers earlier choices and is
remembered later (design rule 2), and every person's story pays off at a faction
swing, so the people and the politics are the same game.

## What gets built (recommended)

### 1. Her
- **Name.** The player names her (default Marguerite) on the title screen.
- **Character.** Three tendencies that form from her choices: devout or worldly,
  bold or careful, warm or cool. Shown as "what is said of her". Some choices need
  a tendency (only a bold woman goes to the Châtelet herself); some text changes with it.
- **What she wants.** Chosen at the wedding, one of four:
  - *Brécourt*: her father's house back in her blood;
  - *The queen's household*: a place among the queen's own ladies;
  - *Her children*: two children placed in good houses;
  - *Her soul*: a chapel endowed in her name and a quiet end.
  Tracked on the House tab, scored at the end (10 points), named in the epitaph.
- **Her own words.** At the end of each act, a page "from the margins of her
  book of hours": a first-person reflection built from what actually happened.

### 2. The spine: Brécourt (eight beats, 1402 to 1422)
Her father dies in 1403 with no son. Her cousin Gérard, a Burgundian household
knight, takes Brécourt, citing the clause in her marriage contract by which she
renounced her inheritance for her dowry. (The contract scene now asks whether she
signs it: an Act 1 choice that comes due twenty years later.) Gérard marries
Jacqueline d'Aubercourt, her rival, who now sits in her father's hall. Her mother
is turned out to her dower house and must fight for her dower: the law that will
one day protect Marguerite, shown first on someone she loves. The case runs in
the Parlement of Paris through the civil war. When the Armagnacs take Paris in
1413 she can have Gérard ruined; when the Burgundians return in 1418, he comes
back with them. It ends in 1420 to 1422 with judgment, ruin, or the medieval
settlement: her child betrothed to his.

### 3. Four people with stories
| Person | Arc (beats) | Pays off |
|---|---|---|
| Her husband | The first winter; his debts or his brother; Melun 1405, whose side; Jean Petit's speech 1408; letters from the war; the eve of Agincourt; captivity or burial | A **regard** track (respect, not romance): how he speaks to her, whether he takes counsel, how the epitaph remembers him |
| Ysabel de Fontenoy | Dice debts; a scandal; a dangerous letter for the Duchess of Orléans; arrested by the Cabochiens in 1413; fleeing in 1417 | If saved and sheltered, she is the one who warns her before May 1418 |
| Jacqueline d'Aubercourt | Marries Gérard; takes the place at court; ruined in 1413 and comes to beg; powerful again in 1418 | Mercy or revenge in 1413 decides whether she protects or denounces her in 1418, and whether the settlement is possible |
| Her mother | Her father's last illness; turned out; the dower fight; her death | Teaches the dower law; leaves her what she kept |

Christine de Pizan, the queen and the children get arcs in the next round, once
the voice of this one is approved.

### 4. The engine
A **story-beat system** (`src/data/arcs.data.js`, `src/engine/arcs.js`): each beat
has a date window, conditions (trust, flags, tendencies, her want, her husband's
state), text with variants, and choices whose effects set flags later beats read.
At most one beat a half-year, the spine first; systemic events thin out when a
beat fires. Conditions are data, not code, so a validator can check that every
flag a beat reads is set somewhere and every beat can fire.

## Worked example
Spring 1404, at court. She signed the renunciation in 1400, and in 1400 she
spoke for Ysabel against Jacqueline. A card: *A wedding at Brécourt*. Jacqueline
is to marry Gérard in her father's chapel, and the invitation is in Jacqueline's
own hand. Three choices: go and be gracious (reputation up, and Jacqueline's
contempt sharpens, because grace from a loser is an insult); refuse (her
mother's trust up, Jacqueline's grudge recorded); go and wear her father's ring,
which Gérard has claimed (bold only: the hall sees it; Gérard's standing falls,
and he will remember in 1418).

## What will be measured
- Every beat fires in some policy's runs (soak, 11 policies x 200 seeds); no beat is unreachable.
- Every flag a beat reads is set by some choice (no decoration, rule 2).
- No raw tokens or impossible people (the dead never speak) across full bot runs.
- Balance: the kill-gate table re-run; any shift disclosed.
- Ages: the 17/18 tests still hold.

## Not in this round
Christine's, the queen's and the children's arcs; art; the Rose debate. They
follow once the voice of this round is approved.

---

## As built (2026-10-29)
- **Her:** the player names her; three tendencies (devout/worldly, bold/careful,
  warm/cool) form from 40+ choices and unlock or close others; four wants chosen
  at the wedding, tracked on the House tab and worth 10 points; a margin page in
  her own words at the end of Acts 2 and 3, and her last words at the end.
- **Story beats:** 25 beats in five threads (Brécourt 9, her husband 7, Ysabel 6,
  Jacqueline 2, her own life 1), 66 choices, condition and effect data checked
  by `test/story.test.js`. The contract scene now asks whether she renounces
  Brécourt.
- **Payoffs wired into the systems:** Jacqueline's mercy or revenge in 1413 makes
  the 1418 swing x0.35, x0.6 or x1.5; Ysabel's letter from Troyes is a true
  warning of 1418; being seen with the Orléans almoner in 1408 makes 1413 x1.4;
  Burgundy's help takes a third off a ransom; the Brécourt case's odds come from
  hearings, witnesses, the 1400 clause and friends at court.
- **Save version 2**, with a migration; the v1 fixture loads and plays on.

### Measured
- Every beat fired across 11 policies x 30 seeds; no raw tokens; no card without
  an open choice; every flag a beat sets is read somewhere (the check found six
  that were not, all given a reader).
- Careful play sees almost every beat (father, Brécourt, Ysabel 92 to 99%); the
  queen's offer only comes to court players.
- Balance, 400 runs per policy, before -> after:

| Policy | Score before | Score after | Survived after |
|---|---|---|---|
| homebody | 71.5 | 71.0 | 94.8% |
| christine | 68.5 | 64.0 | 87.5% |
| loyal_bur | 63.0 | 75.0 | 86.3% |
| loyal_arm | 54.0 | 71.0 | 84.0% |
| seasonal | 60.0 | 54.0 | 82.3% |
| courtier | 46.0 | 49.0 | 38.8% |

  The score now includes 10 points for her want and gives lands 20 (was 25) and
  children 25 (was 30). Sensible partisans now match or beat staying home
  (kill-gate finding K1 eased): engaging with Jacqueline and the factions pays.
  News is still worth about 2 points (loyal_bur 75 vs 73 deaf): K2 still open.
- Two fixes made during measurement and disclosed: the Brécourt settlement was
  reached in about 90% of games (now it needs Jacqueline's goodwill, or 2,500
  livres to Gérard); a Brécourt judgment could be won from the country on money
  alone (now friends at court weigh as much as hearings).
