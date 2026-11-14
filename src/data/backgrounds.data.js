// Where her family stands when the game opens (audit G: one background was a v1
// limit, and the biggest replay gain). Logic-free. Brécourt is her father's house
// in every start; what changes is where it lies, whose people know it, and what
// it has. `ops` apply at the start (effects.js); `purse` joins the household
// purse at the wedding; `lawyer` is added to her procureur's reliability; `tie`
// is added, all game, to her tie to that party when Paris changes hands.

export const BACKGROUNDS = {
  beauvaisis: {
    label: 'An old house of the Beauvaisis',
    note: 'Your father holds Brécourt of the bishop of Beauvais and has kept out of the princes\' quarrels. A little of everything, and nobody\'s client.',
    of: null,
    ops: [],
  },
  picardy: {
    label: 'A Picard house in Burgundy\'s shadow',
    note: 'Brécourt lies near Péronne, among Burgundian neighbours. The Duke of Burgundy\'s people know your father; the Orléans people know that they do.',
    of: 'a Picard house',
    ops: [['fav', 'bur', 15], ['fav', 'arm', -3], ['trust', 'margaret', 8]],
    tie: { bur: 0.2 },   // all her life she counts as a little Burgundian when Paris changes hands
  },
  valois: {
    label: 'A house in the Orléans service',
    note: 'Brécourt lies in the Valois, in the Duke of Orléans\' own lands, and your father rode for the duke in Italy. The duke has not forgotten, and neither has Burgundy.',
    of: 'a house of the Valois, in the Orléans service',
    ops: [['fav', 'arm', 15], ['fav', 'bur', -3], ['trust', 'valentina', 8]],
    tie: { arm: 0.2 },
  },
  parlement: {
    label: 'A new house of the Parlement',
    note: 'Your grandfather sold cloth in the rue Saint-Denis; your father, a councillor of the Parlement, was ennobled by the king\'s letters and bought Brécourt. Money and lawyers, and a name the old houses smile at.',
    of: 'a new house, ennobled from the Parlement',
    ops: [['rep', -8], ['info', 10]],
    purse: 500,
    lawyer: 0.15,
  },
};

export const BACKGROUND_ORDER = ['beauvaisis', 'picardy', 'valois', 'parlement'];
