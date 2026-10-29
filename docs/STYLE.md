# Style guide: lived in, not performed

The author: "I want to make sure the feeling of chivalry, courtly politics,
feminine nobility and courtly warfare all feel real and lived in, not a
performance." This page is the rule for every line of text in the game.
`tools/lint-style.mjs` reads the lists below and fails `npm run check` on a hit.

## The test
Every line names **a thing, a price, a place, a body, a date or a debt**. A line
that only names a feeling or a virtue is a performance: rewrite it.

| Performed | Lived in |
|---|---|
| "He was a true and chivalrous knight." | "He paid his ransom instalments on the day, which was rarer than courage." |
| "The court was a nest of intrigue." | "Jacqueline has the queen's ear at night. You can tell when she has used it." |
| "As a woman, you had no power." | "Your father decides. Your mother can be asked to speak to him." |
| "The war raged across France." | "A captain from the garrison at Creil wants forty livres not to burn your barns." |

## Rules
1. **Show the constraint, never lecture about it.** Nobody explains women's
   place; the contract, the clause, the custom and the man in the doorway do.
2. **People want things.** Every named person in a card wants something specific
   and says so, or hides it badly.
3. **Money is livres, sous and deniers;** distances are days' ride; dates are
   feasts (Candlemas, Lent, Easter, Pentecost, Saint John, Michaelmas,
   Martinmas, Advent) or months. No clock times.
4. **Chivalry is a set of customs and contracts.** Ransoms have instalments and
   hostages; brothers-in-arms share spoils; a parole is kept or broken. The ideal
   exists (the Court of Love, the ballades), and she sees what it costs.
5. **Tight prose, dialogue, the body.** Short paragraphs. Somebody's hands do
   something. No paragraph over about 80 words.
6. **Second person in cards, first person in her margins, third in the chronicle.**
7. **Real people do only what the record allows them to have done**; what we
   invent around them is marked as rumour or kept small.
8. **Uncertain history is "it is said".**

## Banned: costume words
Fake-archaic address and fairy-tale vocabulary.
- milady
- m'lady
- thee
- thou
- thy
- thine
- hath
- doth
- verily
- forsooth
- chivalrous
- damsel
- wench
- ye olde
- fair maiden

## Banned: modern words
Vocabulary that belongs to our century, not hers.
- empower
- empowered
- trauma
- toxic
- mindset
- closure
- self-care
- feminist
- misogyny
- patriarchy
- teenager
- okay
- weekend
- o'clock
- minutes
- stressful

## Banned: narrator speeches
Phrases that lecture instead of showing.
- a woman's lot
- in a man's world
- as a woman, you
- women had no
- women were not allowed
- it was a different time
