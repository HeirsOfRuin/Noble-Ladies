// The historical clock. Logic-free. Keys are half-years: 'YYYYa' is spring and
// summer (March to August), 'YYYYb' is autumn and winter (September to February).
// An event in January or February sits in the 'b' half of the year before.
//
// The turning points are fixed: she changes her own fate, not history's
// (docs/SPEC.md, decision 5). Dates are checked against standard accounts
// (R. C. Famiglietti, Royal Intrigue, 1986; B. Guenée, Un meurtre, une société,
// 1992; J. Sumption, Cursed Kings, 2015). Sources in README.md.

/** Who holds Paris and the royal council from each half-year onward. */
export const CONTROL = [
  ['1401a', 'contested'],   // Philip of Burgundy and Louis of Orléans share the council
  ['1402a', 'arm'],         // Orléans in the ascendant
  ['1405a', 'contested'],   // John the Fearless marches on Paris (August 1405)
  ['1407b', 'bur'],         // after the murder of Louis of Orléans
  ['1413b', 'arm'],         // the Armagnacs enter Paris
  ['1418a', 'bur'],         // the Burgundians take Paris; from 1420 with the English
];

/** Which side the queen's household is counted with, for a swing's exposure. */
export const QUEEN_SIDE = [
  ['1401a', 'arm'],         // Isabeau and Louis of Orléans worked together; Burgundian talk made it worse
  ['1408a', 'none'],        // she mediates between the princes
  ['1417b', 'bur'],         // freed from Tours by John the Fearless (November 1417), she rules with him
];

/**
 * Faction swings. When one fires, her ties to the losing side (favour, her
 * husband's party, her place in the queen's household) set what it costs her;
 * her ties to the winner set what she gains. danger applies only if she is at
 * court in that half-year. Warnings can reach her up to CONFIG.warningLead turns before.
 */
export const SWINGS = {
  '1407b': { winner: 'bur', losers: ['arm'], severity: 0.5, danger: 0, title: 'Paris turns to Burgundy',
    warnings: ['A servant of the Duke of Burgundy is buying horses in Paris and paying in gold.', 'Men say the Duke of Burgundy will not forgive Orléans for the taxes, and that something will be done about it.'] },
  '1413a': { winner: 'bur', losers: ['arm', 'queen'], severity: 0.7, danger: 0.8, title: 'The Cabochiens',
    warnings: ['The butchers of the Grande Boucherie are arming their journeymen.', 'The Burgundians in the city talk of a list of the queen\'s people who rob the king.'] },
  '1413b': { winner: 'arm', losers: ['bur'], severity: 0.8, danger: 0.3, title: 'The Armagnacs take Paris',
    warnings: ['The burgesses are sick of the butchers. They say they would open the gates to the princes.', 'The Armagnac lords are at Pontoise, and talking terms.'] },
  '1417a': { winner: 'arm', losers: ['queen'], severity: 0.5, danger: 0.4, title: "The queen's household is broken up",
    warnings: ['The Count of Armagnac is said to keep a list of the queen\'s gentlemen.', 'There is talk of the queen being sent away from Paris.'] },
  '1418a': { winner: 'bur', losers: ['arm'], severity: 1.0, danger: 1.0, title: 'The Burgundians take Paris',
    warnings: ['Someone in the city has a copy of the key to the Porte Saint-Germain.', 'Burgundian men-at-arms are gathering at Pontoise, a day\'s ride away.'] },
  '1420a': { winner: 'bur', losers: ['arm'], severity: 0.7, danger: 0, title: 'The Treaty of Troyes',
    warnings: ['The English king and the young Duke of Burgundy are said to have agreed terms.', 'Lawyers in Paris are drawing up lists of Dauphinist lands.'] },
};

/** Rumours with no truth in them. Low information lets more of these through. */
export const FALSE_RUMOURS = [
  'The Duke of Berry is dying and has left everything to the queen.',
  'The king has been cured by a hermit from Guyenne.',
  'Burgundy and Orléans are to marry their children and end it all.',
  'The English have landed at Calais with forty thousand men.',
  'The queen is with child by a groom of the stables.',
  'The Parlement will annul every grant made since the king\'s last illness.',
  'Paris will be put under interdict by the pope at Avignon.',
];

/**
 * The hand-written turning points (design rule 6: hand-write only these and the
 * act transitions). Each fires once, in its half-year, as a card. The engine
 * appends what it meant for her, from her position.
 */
export const HISTORY = {
  '1401a': { title: 'The Court of Love', text: 'In February a Court of Love is founded in Paris, at the Hôtel d\'Artois, under the princes\' patronage: a company of poets and gentlemen who will judge ballades and swear to honour ladies. The ladies themselves are not members. They are the subject.' },
  '1404a': { title: 'The Duke of Burgundy is dead', text: 'Philip the Bold dies in April at Hal, so deep in debt that his widow lays her purse and keys on his coffin to refuse his creditors. His son John takes the duchy. John is harder, poorer and less patient than his father.' },
  '1405a': { title: 'Burgundy marches on Paris', text: 'In August John of Burgundy comes to Paris with an army. The queen and the Duke of Orléans leave for Melun with the Dauphin, and Burgundian riders bring the boy back on the road. For a few weeks two armies face each other across the Seine. Then the princes are reconciled, for now.' },
  '1407b': { title: 'The murder in the Rue Vieille-du-Temple', text: 'On the evening of 23 November, Louis, Duke of Orléans, leaves the queen\'s house in the Rue Vieille-du-Temple and is cut down in the street by masked men. Within days John of Burgundy admits he ordered it, and rides for Flanders. Paris cheers him.' },
  '1408a': { title: 'The justification', text: 'In March, at the Hôtel Saint-Pol, the theologian Jean Petit speaks for four hours to prove that the killing of a tyrant is lawful. The court listens. The Duchess of Orléans, in black, asks for justice and does not get it.' },
  '1408b': { title: 'The Duchess of Orléans is dead', text: 'Valentina Visconti dies at Blois in December, still asking for justice for her husband. Her son Charles, fourteen years old, is now Duke of Orléans.' },
  '1409a': { title: 'The Peace of Chartres', text: 'In March, in the cathedral at Chartres, the Duke of Burgundy asks the king\'s pardon, and the young Orléans princes are made to forgive their father\'s murderer. Nobody believes it.' },
  '1410a': { title: 'The League of Gien', text: 'In April the princes opposed to Burgundy swear a league at Gien: Orléans, Berry, Bourbon, Alençon, and Bernard, Count of Armagnac, whose daughter marries the young Duke of Orléans. From now on Paris calls them the Armagnacs.' },
  '1413a': { title: 'The Cabochiens', text: 'In April the butchers of Paris, led by the skinner Caboche and backed by Burgundy, take the city. They break into the Dauphin\'s house and into the queen\'s, and drag away her brother and her ladies. For three months the white hoods rule Paris.' },
  '1413b': { title: 'The Armagnacs take Paris', text: 'The city tires of the butchers. In August the Armagnac princes ride in and John of Burgundy flees. Now it is the Burgundians\' turn to lose their offices and their houses.' },
  '1414b': { title: 'The Peace of Arras', text: 'In September a peace is agreed at Arras between the king and the Duke of Burgundy. It settles little, and the English king is watching.' },
  '1415a': { title: 'The English at Harfleur', text: 'In August Henry, King of England, lands at the mouth of the Seine and lays siege to Harfleur. The summons goes out to the nobility of France.' },
  '1415b': { title: 'Agincourt', text: 'On 25 October, in a muddy field between two woods near Agincourt, the English army destroys the French. The dead include the Constable of France, three dukes and a great part of the northern nobility. The young Duke of Orléans is found alive among the dead and taken to England. In December the Dauphin Louis dies of a fever.' },
  '1416a': { title: 'The Duke of Berry is dead', text: 'In June Jean, Duke of Berry, the king\'s last uncle, dies in Paris at seventy-five, owing so much that his jewels and books are sold to pay his debts.' },
  '1417a': { title: "The queen's household is broken up", text: 'In April the Count of Armagnac, now master of Paris, accuses the queen\'s household of disorder. Her steward, Louis de Bosredon, is tortured and drowned in the Seine. The queen is sent under guard to Tours. In August the English land again, in Normandy.' },
  '1417b': { title: 'The queen goes to Burgundy', text: 'In November the Duke of Burgundy\'s men free the queen at Tours. She declares herself regent and sets up a government at Troyes, against the Armagnacs in Paris.' },
  '1418a': { title: 'The Burgundians take Paris', text: 'On the night of 28 May a gate is opened to Burgundian men-at-arms. The Dauphin Charles is carried out of the city, it is said, wrapped in a blanket. In June the mob breaks the prisons and kills the Armagnacs inside, the Count of Armagnac among them.' },
  '1418b': { title: 'The great sickness, and Rouen', text: 'In the autumn an epidemic kills thousands in Paris; the gravediggers cannot keep up. In January, starved for months, Rouen surrenders to the English.' },
  '1419b': { title: 'Montereau', text: 'On 10 September, on the bridge at Montereau, John the Fearless kneels before the Dauphin and is killed with an axe by the Dauphin\'s men. His son Philip goes over to the English.' },
  '1420a': { title: 'The Treaty of Troyes', text: 'In May the mad king seals a treaty at Troyes that disinherits his own son and makes Henry of England heir to France. In June Henry marries the king\'s daughter Catherine. In Paris the lands of the Dauphin\'s supporters are given away.' },
  '1422a': { title: 'The English king is dead', text: 'At the end of August Henry V dies at Vincennes of a flux, at thirty-five. His heir is a baby nine months old.' },
  '1422b': { title: 'The king is dead', text: 'On 21 October Charles VI dies at the Hôtel Saint-Pol, after forty-two years as king and thirty of them mad. Few of the great lords follow his body to Saint-Denis. A herald cries long life to Henry, King of France and England. South of the Loire, the Dauphin calls himself king.' },
};

/** Years an epidemic raises the risk to anyone at court, and to children. */
export const PLAGUE = { '1418b': 1.0, '1412a': 0.4 };

/** The acts, by the half-year each one starts. */
export const ACTS = [
  { act: 1, title: 'The Contract', from: null },
  { act: 2, title: 'The Young Wife at Court', from: '1401a' },
  { act: 3, title: 'The Faction War', from: '1408a' },
  { act: 4, title: 'The Aftermath', from: '1416a' },
];

export const ACT_CARDS = {
  2: 'Act Two. The young wife at court, 1401 to 1407. You have a husband, a household and a name to build. The princes are already quarrelling.',
  3: 'Act Three. The faction war, 1408 to 1415. The court has split. Standing between the parties costs more every year.',
  4: 'Act Four. The aftermath, 1416 to 1422. What survives now depends on what you built, and on whom you married your children to.',
};
