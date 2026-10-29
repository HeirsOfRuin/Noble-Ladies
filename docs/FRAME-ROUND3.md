# Frame: round 3 (favours, children, letters, Christine, the queen, a lived-in world)

## The author's words
> "I agree with your plan. I think our target should be 90-120 minutes per run.
> The playthrough dealt like a good voice. I want to make sure the feeling of
> chivalry, courtly politics, feminine nobility and courtly warfare all feel real
> and lived in, not a performance." (2026-10-29)

Approved from the last round: favours owed, children as people, letters and
interception, then Christine's and the queen's threads. The voice is approved.

## The design rule: lived in, not performed
Chivalry, court politics, a noblewoman's life and war appear as **obligations,
objects, prices and risks the player handles**, never as speeches about them.
- **Chivalry is a set of contracts and customs men keep or break**: ransoms with
  instalments and hostages, brotherhood-in-arms with shared spoils, a parole given
  and kept, a combat staged for a prince's glory. The game shows the ideal (the
  Court of Love's ballades) and, through her eyes, what it costs the women it is
  sung about. Christine's quarrel over the *Romance of the Rose* is exactly that
  argument, and she can take part in it.
- **Court politics is precedence, badges, gifts and debts.** Who walks first; who
  wears the porcupine or the carpenter's plane; what she gives the queen at New
  Year; who owes whom.
- **A noblewoman's life is work and law.** Keys and accounts, the lying-in and the
  churching, the wet nurse, her own seal, her dower, her suits in the Parlement,
  her children placed in other households as pages and as pledges.
- **War reaches her through the household**: captains who sell protection
  (*appatis*), safe-conducts bought from the other side, a house held while the
  men are away, horses and harness to pay for, ransom contracts to meet.

The test for every new line: does it name a thing, a price, a place, a body or a
debt? If it only names a feeling or a virtue, it is a performance. Rewrite.

## What gets built

### 1. Favours owed (the obligation ledger)
- Help given or received creates a debt: you lend Ysabel 200 livres, she owes you;
  Jacqueline speaks for you, you owe her; a patron grants a pension, you owe them.
- **Calling one in** (an action, no go-between: you ask in person): money, a word
  to their party, or news. Each debt can be called once.
- **Your debts get called in**: at a bad moment, someone asks for something that
  costs you. Refuse and lose their trust and some of your name ("a lady who does
  not pay what she owes").
- The House tab lists who owes you and whom you owe.

### 2. Children as people
- Each child has a temperament (bookish, wilful, sickly, sweet-natured, devout).
- At seven, an upbringing: a son as **page in a great household** (Orléans,
  Burgundy, Berry), at home, or for the Church; a daughter in **the queen's
  household**, at **the Dominican priory of Poissy** (where Christine's daughter
  was a nun), or at home. A child placed in a great household is an alliance and a
  pledge: their household's fall at a swing puts the child at risk.
- Each child gets a beat of their own between twelve and sixteen, from their
  temperament and placement. No romance, ever: what is at stake is the house.

### 3. Letters and interception
- Letters become the main road for news. Court talk alone gets thinner and less
  reliable; correspondents (Christine, Ysabel, the queen's ladies, her mother) get
  better. This is the fix for kill-gate finding K2 (news worth only ~2 points).
- How a letter goes matters: by her own man (quick, can be opened) or by Brother
  Robert (a half-year slower, safe). A letter to the other party's people may be
  opened, and an opened letter is evidence against her at the next swing.
- She can have letters opened herself, through Perrette: leverage over a rival,
  at the risk of being caught.

### 4. Christine de Pizan (five beats)
The Quarrel of the Rose (1401-02: Christine sent her dossier to the queen in
February 1402); the *Treasure* (1405: Christine asks how a lady's life really
is, not how the sermons say); Christine's own lawsuits and debts; her advice on
the Brécourt case; Poissy (1418).

### 5. The queen (four beats)
A night during the king's madness; the flight to Melun (1405); the death of her
son the Dauphin Louis (December 1415); exile to Tours (1417) and the Treaty of
Troyes (1420), where the queen seals away her own son's crown.

### 6. A lived-in world (texture systems)
- **Badges.** From 1411 Paris wears the cross of Saint Andrew for Burgundy, the
  Armagnacs the white sash. Her household's colours become a setting: none, or
  openly one side's. Wearing them gains that side's favour and makes her visible
  when the city turns.
- **Protection money.** In the war years a captain from the nearest garrison sends
  for *appatis*. Pay, refuse and risk the raid, or buy a safe-conduct through a
  patron (a debt). This replaces the generic "barns burned".
- **After childbirth:** the churching, and a wet nurse (hired or not: the child's
  health against the nurse's loyalty and wages).
- **New Year's gifts (étrennes)** at court: whom she gives to, and what (a book, a
  jewel, a greyhound). Gifts given create debts; gifts received do too.
- **Chivalry as practice:** her husband may be chosen for the combat of seven
  against seven at Montendre (1402); he may swear brotherhood-in-arms with a knight
  who later stands on the other side; his ransom comes with a contract, hostages
  and a Lombard banker.
- **Feast days** date the cards: Candlemas, Lent, Pentecost, Saint John,
  Michaelmas, Martinmas, Advent.
- **Style guide and lint** (`docs/STYLE.md`, `tools/lint-style.mjs` in `npm run
  check`): banned costume words (milady, thee, chivalrous), banned modern
  vocabulary (empower, trauma, journey), banned narrator speeches about women's
  lot, money in livres and sous, no clock times.

## Playtime target: 90 to 120 minutes
Measured by a playtime estimate from the bot's decisions per run (scenes and cards
at about 30 seconds, plans at about 60 seconds), checked against the author's
own timed playthrough.

## What will be measured
- Every new beat fires somewhere; no raw tokens; every flag and debt is read.
- K2: information value (policy vs `+deaf`) before and after the letters change.
- The kill-gate table, with shifts disclosed.
- Playtime estimate in the 90 to 120 minute band.
- The style lint passes on all text.

## Order of work
Style guide and lint, then texture, favours, letters, children, Christine and
the queen, then measurement. A commit after each.
