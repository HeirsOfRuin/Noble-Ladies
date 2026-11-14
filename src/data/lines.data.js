// Wordings for the half-year's routine results, so the same action does not
// read the same way twenty times in a run (the audit counted "You waited on the
// queen" 20-39 times a game). Logic-free: the engine cycles through each list
// in order, and fills {tokens}. Every line names a thing, a place or a person
// (docs/STYLE.md), not a feeling.

export const SAY = {
  attend: [
    'You waited on the queen.',
    'You carried the queen\'s train at mass in the chapel of the Hôtel Saint-Pol.',
    'You sat with the queen\'s ladies over their sewing and heard who had quarrelled with whom.',
    'You held the queen\'s book at vespers, and she spoke to you twice.',
    'You rode behind the queen\'s litter to Vincennes and back.',
    'You played at tables with the queen\'s ladies and lost what it was polite to lose.',
  ],
  accounts: [
    'You went through the rolls with {steward}.',
    'You sat with {steward} over the rent rolls and the tallies, line by line.',
    'You counted the granary yourself and set it against {steward}\'s figures.',
    'You heard the reeves\' accounts in the hall, with {steward} standing behind them.',
    'You checked the mill tolls and the wood sales against what {steward} had written.',
  ],
  children: [
    'You saw to the children: their health, their letters, their manners.',
    'You heard the children\'s letters, and found the nurse a girl to help her.',
    'You sat with the children at their lessons, and had the chaplain teach the eldest to count.',
    'You dosed the children for worms and had them say their prayers to you.',
  ],
  letter: [
    'Your man rides with a letter to {name}.',
    'Your groom takes a letter to {name}, sewn into his doublet.',
    'A letter to {name} goes with your man, under your seal.',
  ],
  answered: [
    '{name} has answered your letter.',
    'A reply from {name}, in a careful hand.',
    'An answer from {name} came with the carrier from Paris.',
  ],
  tenants: [
    'You sat in judgment in the hall. People will speak of it.',
    'You heard the tenants\' quarrels in the hall: a boundary stone, a strayed pig, a widow\'s heriot.',
    'You sat in the hall on the court day and settled what the reeve could not.',
  ],
  rest: [
    'You rested.',
    'You kept to your chamber for a month, and ate what the physician said.',
    'You stayed out of the hall and let the household run without you for a while.',
  ],
};
