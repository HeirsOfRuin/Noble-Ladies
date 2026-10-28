<!-- The author's original design brief, kept as the source. Two edits only: her
     age (author's decision 2026-10-28). Later decisions live in SPEC.md and DESIGN.md. -->

# The Lady of Saint-Pol: Design Brief (working title)

Purpose of this document: the starting brief for building this game. It sets the
concept, the historical frame, the systems, the act structure and the scope of the
first playable version. Treat the "Open questions" section as decisions still to make,
not settled.

---

## 1. Pitch

You play a young noblewoman of a middling French house at the court of the mad King
Charles VI, 1400 to 1422. She cannot command armies or hold office. Her power runs
through other people: her family, her husband, her children, the queen's household,
her servants, her lawyers. Over four acts she negotiates her own marriage, builds a
place at court, survives the civil war between the Armagnac and Burgundian factions,
and comes through Agincourt and its aftermath. The goal is that her house is still
standing at the end, and that she is too.

- **Genre:** turn-based narrative and management sim. Single player. Browser, built
  phone-first.
- **Tone:** historically grounded and sober. Not a romance and not a dating sim.
- **Closest touchstones:** *Crusader Kings* (the court politics), *King of Dragon Pass*
  (decisions from advisers, consequences that arrive late), *Reigns* (reading cards on
  a phone). What sets this game apart: it stays at household scale, follows a single
  life, and gives her no direct force.

## 2. Why this period

- **A court under stress.** Charles VI had bouts of madness from 1392 onward. During
  them, power went to whoever controlled the royal council: his queen, his brother,
  or his uncles and cousins.
- **The winning side keeps changing.** Any side the player picks will be winning at
  some point and losing at another. That makes the faction choice a real gamble, not
  a single "correct" pick.
- **A primary source written for the player.** Christine de Pizan's *The Treasure of
  the City of Ladies* (1405) is a practical manual for noblewomen. It covers running a
  household, guarding reputation, managing estates while the husband is away, handling
  the queen's favour, and widowhood. Use it as the design reference for what a lady
  could do and how she was judged.
- **Real courtly culture.** The *Cour amoureuse* (a Court of Love founded in Paris in
  1401) and the Quarrel of the *Romance of the Rose* (c. 1401 to 1404, a literary
  debate over how women were portrayed, with Christine at its centre) give a literary
  and social layer without inventing one.

## 3. The player character

- An invented lady, born in January 1383 (seventeen in Act 1, married at eighteen; the author's decision of 2026-10-28, see SPEC.md). She is from a middling house: big enough to
  matter, small enough to be crushed.
- Real figures surround her, and she can deal with them directly (see section 7).
- Her family background, her starting traits and the result of her marriage
  negotiation in Act 1 together decide her starting position for Act 2.

## 4. Act structure

The game has four acts. Act 1 is short and works as the tutorial. Acts 2 to 4 are
longer, and each covers a major stage of her life tied to a major court event. Each
act ends on a historical turning point that shakes up the board.

### Act 1: The Contract (1400, age 17; married at 18 in 1401). Tutorial.

- **Situation:** her family is negotiating her marriage. Officially she has no say.
  In practice she can influence the outcome through her mother, her governess, a
  confessor or a servant, and by how she presents herself at a court visit.
- **Narrator and teacher:** her governess or her mother. Each lesson is framed as their
  advice, written in the voice of the *Treasure*.
- **Decisions:**
  - Choose among 2 or 3 suitors. Each brings different wealth, a different faction
    lean, a different character and a different place at court.
  - Persuade her father, or work around him through her mother.
  - Her first small court decision: get a place in the queen's household for herself
    or a cousin, or take a side in a dispute between two ladies.
- **Systems taught, one at a time:** reputation, favour, information, persuasion
  through other people, and consequences that arrive late.
- **Outputs to Act 2:** husband, dowry size, faction lean, a starting reputation, a
  first ally and a first enemy.
- **Length:** short. About 6 to 8 turns, each a few weeks or a single scene.

### Act 2: The Young Wife at Court (1401 to 1407)

- **Situation:** she is newly married. She learns the court, runs a household (or
  a share of her husband's), has her first children, and builds a network.
- **Historical events:**
  - 1401: the *Cour amoureuse* is founded.
  - 1401 to 1404: the *Rose* debate.
  - 1404: Philip the Bold, Duke of Burgundy, dies and his son John the Fearless
    succeeds him.
  - Throughout: the rivalry between Louis of Orléans and Burgundy grows.
- **Act-ending event:** 23 November 1407. Louis of Orléans is murdered in Paris on the
  orders of John the Fearless.
- **Main theme:** building. Gathering resources, allies and a reputation before the
  storm.

### Act 3: The Faction War (1408 to 1415)

- **Situation:** the court splits. Neutrality gets more expensive every year. Her
  husband may be pulled into the fighting.
- **Historical events:**
  - 1408: Jean Petit publicly justifies the murder before the court.
  - 1409: the Peace of Chartres (a hollow reconciliation).
  - 1410: the League of Gien forms the Armagnac party around the young Charles of
    Orléans and Bernard VII, Count of Armagnac.
  - 1413: the Cabochien revolt in Paris, a Burgundian-backed uprising; the
    Armagnacs then take Paris.
  - 1414: the Peace of Arras.
  - 1415: Henry V lands and besieges Harfleur.
- **Act-ending event:** 25 October 1415. Agincourt. A large part of the French
  nobility is killed or captured.
- **Main theme:** survival and choosing a side.

### Act 4: The Aftermath (1416 to 1422)

- **Situation:** she may be widowed, or her husband may be held for ransom in England.
  Widowhood brings the most legal independence she will ever have, and the most
  danger. Her children's marriages now decide the house's future.
- **Historical events:**
  - 1418: the Burgundians take Paris and massacre Armagnacs. The Dauphin escapes.
  - 1419: Rouen falls to the English. John the Fearless is murdered at Montereau.
  - 1420: the Treaty of Troyes disinherits the Dauphin, and Henry V marries Catherine
    of Valois.
- **End:** 1422. Henry V dies in August and Charles VI in October.
- **Main theme:** legacy. What survives, who inherits, which side her house ends up
  on.

## 5. Core loop (Acts 2 to 4)

Each turn is one half-year.

1. **Placement:** at court, or on the estates. This is the central choice.
   - **Court:** expensive (clothes, gifts, lodging, servants). She gains favour and
     information, and her reputation is exposed to risk.
   - **Estates:** brings in income and safety, and lets her repair the household.
     She loses current information and her place at court, and factions shift
     without her.
2. **Actions:** 2 or 3 actions, depending on where she is and how big her household
   is (see section 6).
3. **Letters and events:** news arrives late and is partly unreliable. Events are
   built from the current state of the systems, not fixed scripts.
4. **Resolution:** money, favour, reputation and relationships update. Delayed
   consequences from earlier turns come due.
5. **Historical clock:** fixed events fire on their dates. How they hit her depends on
   her position.

## 6. Systems

### 6.1 Resources

| Resource | What it represents | Main sources | Main drains |
|---|---|---|---|
| **Purse** | Household cash and credit | Estate rents, dowry, pensions, gifts | Court costs, dowries, ransoms, lawsuits, debt |
| **Reputation** | Honour and good name | Piety, patronage, discretion, allies vouching for her | Gossip, scandal, association with the losing side |
| **Favour** | Standing with specific people and factions | Service, gifts, information, loyalty | Faction swings, rivals, absence from court |
| **Information** | What she knows, and how reliable it is | Letters, servants, confessors, other ladies | Absence from court, compromised sources |
| **Household** | Servants, retainers, the estate's condition | Investment, good management | Neglect, war, confiscation |
| **Health** | Her physical condition | Rest, the estates | Childbirth, illness, plague years, stress |

Reputation rules:

- It is slow to build and quick to lose, and it is judged more harshly for women than
  for men.
- Gossip spreads through the relationship web.
- Scandal is not always fatal. It can be contained, denied or outlasted, at a cost.

### 6.2 Relationships

- She has named relationships with about 10 to 15 figures, each with their own
  agenda.
- Track at least **trust** (does this person believe her) and **usefulness** (does she
  matter to this person) separately.
- NPCs act on their own. They petition, betray, marry, die and switch sides.

### 6.3 Actions (first draft)

**At court:**

- Attend the queen.
- Petition for an office, a pension or a favour for a relative.
- Give a gift.
- Gather gossip.
- Spread a rumour (this carries risk).
- Arrange a meeting.
- Take part in a *Cour amoureuse* event or a literary exchange.

**On the estates:**

- Manage rents and accounts.
- Repair or defend the property.
- Hear tenant disputes.
- Rest and recover.
- Raise the children.

**Anywhere:**

- Write a letter to an ally, a lawyer or her husband.
- Start or pursue a lawsuit in the Parlement of Paris.
- Endow a chapel or commission a book.
- Negotiate a child's marriage.
- Take on or dismiss a servant.

### 6.4 Indirect power (the defining rule)

She almost never acts directly on outcomes. She acts through intermediaries, and each
intermediary:

- has their own reliability, loyalty and agenda;
- can fail, delay, misreport or betray;
- costs something: money, favour, or a favour owed in return.

If the player can simply "do things," this becomes a generic court stats game.
Persuading, writing, bargaining and waiting are the game.

### 6.5 Marriage and children

- **Act 1:** her own marriage contract (dowry, dower, alliance).
- **Acts 2 to 4:** children's births (with real risk), their upbringing and their
  marriages. Each child's marriage is a contract and an alliance that ties her house
  to another.
- Daughters need dowries, and a dowry is a large drain on the Purse. Sons need
  positions and patrons.

### 6.6 Law and widowhood

- Noblewomen litigated often in the Parlement of Paris over dowries, dower,
  inheritances and boundaries. Lawsuits are slow, multi-year and expensive, and they
  can be won.
- **Dower:** a widow's customary share of her husband's lands. The Paris custom was
  generous, often given as half. **Verify the exact rule before writing the mechanic.**
- Widowhood: she gains direct legal control over her affairs, and she becomes a target
  for remarriage pressure, lawsuits from her husband's kin, and predatory "protectors."

### 6.7 Faction state

- Two main factions, Armagnac and Burgundian. The Crown and the queen move between
  them. The English become a third pole after 1415.
- Each faction's control of Paris and the council shifts on the historical clock.
- Her standing with each faction decides how each swing hits her: rewards, being
  ignored, fines, confiscation of lands, or danger to her life (1413, 1418).
- Hedging (keeping ties to both sides) is possible. It costs more, and either side
  can expose it.

### 6.8 Husband

- Generated in Act 1. He has traits: competence, loyalty to her, faction loyalty,
  temper, spending habits.
- He makes his own decisions. She can influence him, not control him.
- His fate at Agincourt (killed, captured, absent, survived) depends on his traits, the
  faction state and her choices. **It is not fixed.** A capture means a ransom (a heavy
  drain on the Purse) and years of absence.

## 7. Historical cast (first draft)

| Figure | Role | Notes |
|---|---|---|
| Charles VI | King | Mad in episodes. Rarely present. A source of instability. |
| Isabeau of Bavaria | Queen | The most important patron. Her household is the lady's main point of entry. |
| Louis, Duke of Orléans | King's brother | Glamorous and powerful. Murdered 1407. |
| Valentina Visconti | Duchess of Orléans | Seeks justice for Louis. Dies 1408. |
| Philip the Bold | Duke of Burgundy | Dies 1404. |
| John the Fearless | Duke of Burgundy from 1404 | Orders Louis's murder. Murdered 1419. |
| Jean, Duke of Berry | King's uncle | Great patron of the arts. A possible neutral protector. |
| Charles of Orléans | Louis's son | Poet. Captured at Agincourt and held in England for 25 years. |
| Bernard VII, Count of Armagnac | Leads the Armagnac party | Killed in the 1418 massacre. |
| Christine de Pizan | Writer | Possible mentor or correspondent. Her own life is a model of widowhood. |
| Louis, Duke of Guyenne | Dauphin | Dies 1415. |
| Charles (later Charles VII) | Dauphin from 1417 | Disinherited at Troyes. |
| Henry V | King of England | Arrives in Act 3, dominates Act 4. |

**Invented cast:**

- her mother;
- her governess;
- her father;
- 2 or 3 suitors;
- a confessor;
- a rival lady;
- a steward;
- a lawyer;
- 1 or 2 lady friends.

## 8. Ending and scoring

The game ends in 1422, or earlier if she dies or is ruined.

Score her legacy on:

- **House survival:** are the lands held, or lost or confiscated?
- **Children:** did they live, and how well were they placed?
- **Reputation** at the end.
- **Wealth**, after debts.
- **Her own fate:** alive, a widow in control, remarried, or retired to a convent.

Write a closing epitaph, in the voice of a chronicle, built from the final state.

## 9. Design rules

1. **Indirect power, always.** See section 6.4.
2. **Late consequences.** A choice in one act can come due in the next.
3. **Unreliable information.** Letters arrive late, rumours are partly false, and
   allies lie to protect themselves.
4. **No modern romance.** Marriages are contracts. Courtly love is a literary game.
   Affection can exist, but it is a bonus, not the goal.
5. **Handle mortality soberly.** Childbirth and disease are risks she can manage
   through choices, not random punishments.
6. **Events come from systems.** Combine the faction state, her position and her
   relationships to generate events. Hand-write only the historical turning points
   and the act transitions.
7. **Write from the sources.** When in doubt, ask what Christine's *Treasure* would
   advise, and make that a valid strategy, though not always the best one.

## 10. First playable version: scope

**Goal:** a bare-bones run of the whole game, Act 1 to Act 4, so the arc and the
transitions can be tested before any act is deepened.

| Area | Bare-bones scope |
|---|---|
| Act 1 | About 6 scenes, 2 suitors, all 5 tutorial lessons, narrated by the governess |
| Acts 2 to 4 | Half-year turns. About 12 to 16 turns per act. |
| Historical events | Only the act-ending turning points plus 2 or 3 key events per act |
| Resources | Purse, Reputation, Favour (per faction), Information. Household and Health can be simple. |
| Cast | About 8 named figures with relationships |
| Actions | About 8 core actions |
| Children | 1 to 3 children, with one marriage negotiation in Act 4 |
| Faction state | Armagnac and Burgundian control of Paris, swinging on schedule |
| Husband | Simple traits, plus the Agincourt fate roll |
| Ending | A score and a short epitaph |
| Platform | Browser and phone, saving progress to the device |

**Not in the first version:** lawsuits beyond one example, book commissions, the
*Rose* debate, the full *Cour amoureuse*, deep estate management, English occupation
detail.

**Test of success:** a player can finish a run in about 60 to 90 minutes, and two runs
end differently because of the choices made.

## 11. Risks

| Risk | Mitigation |
|---|---|
| It becomes a menu of social stats | Indirect power, late consequences, information that is partly false |
| The amount of narrative content swamps the build | Events from systems. Hand-write only the turning points. |
| Too similar to *Crusader Kings* | Household scale, a single life, no armies |
| Faction swings feel like random punishment | Warning signs in letters and rumours before each swing. Hedging is possible. |
| Act 1 is too long or reads like a lecture | Keep it to about 6 scenes. Each lesson is a choice, not a text box. |
| Historical errors | Verify dates and legal customs (especially dower) before they become mechanics |

## 12. Open questions

1. Working title. "The Lady of Saint-Pol" refers to the Hôtel Saint-Pol, the royal
   residence in Paris. Alternatives: "City of Ladies," "The Queen's Household."
2. Is there one fixed family background, or a choice of 2 or 3 at the start?
3. Can she die before 1422 and the game continues with an heir, or does her death end
   the game? (Recommended: her death ends the game, because this is her life.)
4. Art direction: illuminated-manuscript style (fits the period and is cheap to fake
   with borders and initials), or text only for the first version?
5. How much of the real figures' fates can she change? (Recommended: none of the
   turning points. She changes her own fate, not history's.)

## 13. Build notes for the new session

- Use the game-building skill before writing game logic. It covers seeded random
  numbers, batch runs for balancing, saving to the device and a phone smoke test.
- Separate data (events, cast, the historical clock) from the engine, so content can
  grow without code changes.
- Build a batch-run harness early, to check that runs end differently and no single
  strategy dominates.
- Build the order as: engine and turn loop, resources, faction clock, relationships,
  Act 1, then acts 2 to 4.
