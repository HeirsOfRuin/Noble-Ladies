// The cast. Logic-free. Real figures carry their historical exits (from/gone are
// half-year keys); invented figures carry ranges the seed draws from once and
// stores in the save.
//
// trust: does this person believe her (0-100). use: does she matter to them (0-100).
// rel: as an intermediary, how often they do what they were asked, on time (0-1).
// loyalty: how likely they are to keep her secrets when it costs them (0-1).

export const LADY = { name: 'Marguerite', house: 'Brécourt', title: 'Marguerite de Brécourt' };

export const CAST = {
  // Patrons: the people a petition goes through
  queen: { name: 'Isabeau of Bavaria', short: 'the queen', role: 'patron', faction: 'queen', real: true, trust: 15, use: 5, rel: 0.7, loyalty: 0.5,
    note: 'Queen of France. Her household is the way in. She protects her own when she can, and cannot always.' },
  valentina: { name: 'Valentina Visconti', short: 'the Duchess of Orléans', role: 'patron', faction: 'arm', real: true, trust: 10, use: 5, rel: 0.75, loyalty: 0.7, gone: '1408b', goneHow: 'died',
    note: 'Duchess of Orléans, Milanese, cultivated, and disliked in Paris for it.' },
  charles_o: { name: 'Charles of Orléans', short: 'the Duke of Orléans', role: 'patron', faction: 'arm', real: true, trust: 10, use: 5, rel: 0.6, loyalty: 0.6, from: '1409a', gone: '1415b', goneHow: 'was taken prisoner to England',
    note: 'The murdered duke\'s son. Young, a poet, and the figurehead of his father\'s party.' },
  bernard: { name: 'Bernard, Count of Armagnac', short: 'the Count of Armagnac', role: 'patron', faction: 'arm', real: true, trust: 5, use: 5, rel: 0.65, loyalty: 0.4, from: '1410a', gone: '1418a', goneHow: 'was killed by the Paris mob',
    note: 'A Gascon soldier who leads the Orléans party in fact. Hard, effective, and hated in Paris.' },
  margaret: { name: 'Margaret of Bavaria', short: 'the Duchess of Burgundy', role: 'patron', faction: 'bur', real: true, trust: 10, use: 5, rel: 0.8, loyalty: 0.6,
    note: 'Wife of John the Fearless. She governs his lands while he is in Paris, and runs them well.' },
  berry: { name: 'Jean, Duke of Berry', short: 'the Duke of Berry', role: 'patron', faction: 'none', real: true, trust: 10, use: 5, rel: 0.55, loyalty: 0.6, gone: '1416a', goneHow: 'died',
    note: 'The king\'s uncle. Collector of books and jewels, always in debt, and a possible protector for anyone caught between the parties.' },

  // Correspondents and household
  christine: { name: 'Christine de Pizan', short: 'Christine', role: 'mentor', faction: 'none', real: true, trust: 10, use: 10, rel: 0.85, loyalty: 0.85,
    note: 'Widow, writer, the best-informed woman in Paris who belongs to no party. Writes for a living, so she values patrons.' },
  friend: { name: 'Dame Ysabel de Fontenoy', short: 'Ysabel', role: 'friend', faction: 'queen', invented: true, trust: [35, 55], use: [25, 40], rel: [0.6, 0.85], loyalty: [0.55, 0.85],
    note: 'A lady of the queen\'s household. Your friend, as far as the court allows friends.' },
  rival: { name: 'Dame Jacqueline d\'Aubercourt', short: 'Jacqueline', role: 'rival', faction: 'bur', invented: true, trust: [0, 15], use: [10, 25], rel: [0.4, 0.6], loyalty: [0.2, 0.4],
    note: 'Ambitious, well connected, and in your way.' },
  steward: { name: 'Jehan Malet', short: 'your steward', role: 'steward', faction: 'none', invented: true, trust: [40, 60], use: [50, 60], rel: [0.55, 0.95], loyalty: [0.5, 0.9],
    note: 'He keeps the accounts and collects the rents when you are away. Whether he keeps all of them is another question.' },
  maid: { name: 'Perrette', short: 'Perrette', role: 'servant', faction: 'none', invented: true, trust: [40, 60], use: [40, 50], rel: [0.5, 0.9], loyalty: [0.4, 0.9],
    note: 'Your chamberwoman. Servants hear everything, and talk to other servants.' },
  confessor: { name: 'Brother Robert', short: 'your confessor', role: 'confessor', faction: 'none', invented: true, trust: [50, 70], use: [30, 40], rel: [0.7, 0.9], loyalty: [0.7, 0.95],
    note: 'A Celestine friar. The Celestines are favoured by the royal house, so he hears more than confessions.' },
  lawyer: { name: 'Master Pierre Lorfèvre', short: 'your procureur', role: 'lawyer', faction: 'none', invented: true, trust: [30, 50], use: [20, 30], rel: [0.55, 0.85], loyalty: [0.6, 0.9],
    note: 'A procureur in the Parlement of Paris. Slow, expensive, and better than most.' },
  mother: { name: 'Dame Alix', short: 'your mother', role: 'family', faction: 'none', invented: true, trust: [55, 75], use: [40, 55], rel: [0.6, 0.85], loyalty: [0.85, 1],
    note: 'She married at sixteen and has run your father\'s house for twenty years.' },
};

/** Act 1 only: they shape the contract and then step back. */
export const ACT1_CAST = {
  governess: 'Dame Guillemette',
  father: 'Messire Enguerrand de Brécourt',
};

/**
 * Suitors. Two are drawn for each game, with different leanings. Traits are 1-5
 * and the seed nudges each by up to one. lands = holdings, the house's rent base.
 * age is at the time of the contract (1400).
 */
export const SUITORS = [
  { id: 'fresnoy', name: 'Messire Jean de Rouvroy, lord of Fresnoy', short: 'Fresnoy', age: 34, lean: 'bur', lands: 13,
    competence: 3, loyalty: 2, temper: 4, spending: 2, dowryAsk: 2400,
    note: 'A widower with no son, holding lands in Artois from the Duke of Burgundy. Rich, careful with money, short with people.' },
  { id: 'varennes', name: 'Messire Pierre de Varennes', short: 'Varennes', age: 24, lean: 'arm', lands: 9,
    competence: 4, loyalty: 4, temper: 2, spending: 4, dowryAsk: 1600,
    note: 'A chamberlain of the Duke of Orléans. Able, well liked, rising, and he lives as if he had already risen.' },
  { id: 'cramailles', name: 'Messire Hue de Cramailles', short: 'Cramailles', age: 28, lean: 'none', lands: 11,
    competence: 2, loyalty: 3, temper: 3, spending: 3, dowryAsk: 2000,
    note: 'In the Duke of Berry\'s service. Pleasant, unambitious, a little slow.' },
  { id: 'avelin', name: 'Messire Robert d\'Avelin', short: 'Avelin', age: 30, lean: 'bur', lands: 10,
    competence: 3, loyalty: 3, temper: 3, spending: 1, dowryAsk: 1800,
    note: 'A Flemish-speaking knight of the Burgundian household. Frugal, devout, dull at table.' },
];

export const CHILD_NAMES = {
  son: ['Jean', 'Guillaume', 'Pierre', 'Louis', 'Robert', 'Enguerrand', 'Charles'],
  daughter: ['Jeanne', 'Marguerite', 'Catherine', 'Marie', 'Blanche', 'Agnès', 'Isabeau'],
};

/** Houses that offer for a child's hand in Act 4. rank 1-3. All invented. */
export const MATCH_HOUSES = [
  { name: 'the lord of Saint-Lié', rank: 3, faction: 'bur' },
  { name: 'the lord of Aunoy', rank: 2, faction: 'arm' },
  { name: 'the lord of Montrevel', rank: 2, faction: 'bur' },
  { name: 'the lord of Vieilchastel', rank: 1, faction: 'none' },
  { name: 'the lord of Gamaches-le-Petit', rank: 1, faction: 'arm' },
  { name: 'the lord of Ronquerolles', rank: 3, faction: 'arm' },
];
