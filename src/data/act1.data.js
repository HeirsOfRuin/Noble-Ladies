// Act 1: The Contract. 1400. She is seventeen; the wedding is in the spring of
// 1401, after her eighteenth birthday. Seven scenes, one lesson each, every
// lesson taught by a choice rather than a text box (brief, section 11).
//
// The governess speaks in the voice of Christine de Pizan's Treasure of the City
// of Ladies (1405); her lines paraphrase its advice, they do not quote it.
//
// Tokens: {a} and {b} are the two suitors' short names, {A} and {B} their full
// names, {father}, {governess}, {lady}. Effects are the engine's declarative
// ops (src/engine/effects.js). Choices marked kind: are resolved by the engine
// in src/engine/act1.js because their result depends on who carries them out.

export const ACT1 = [
  {
    id: 'offers', when: 'Lent, 1400', lesson: 'Reputation',
    governess: 'A lady\'s good name is the first thing she owns and the last thing she should spend. It is built slowly, by many small proofs, and lost in an afternoon.',
    text: 'Two offers for your hand have come to your father, {father}. One is from {A}; the other from {B}. Both houses will send men to the Easter feast in your father\'s hall, and those men will report on you. You are seventeen. Officially, none of this is your affair.',
    choices: [
      { label: 'Keep your eyes down, speak little, be seen at prayer', ops: [['rep', 6], ['trait', 'devout', 1], ['trait', 'bold', -1]], note: 'Slow and sure.' },
      { label: 'Talk well at table and let them see your wit', kind: 'gamble', p: 0.5, ops: [['trait', 'bold', 1]], win: [['rep', 3], ['info', 8]], lose: [['rep', -4], ['info', 8]], note: 'You may be admired, or thought forward. Either way you hear more.' },
      { label: 'Give alms at the gate, where everyone can see', ops: [['purse', -40, 'alms at Easter'], ['rep', 4], ['trust', 'confessor', 6], ['trait', 'devout', 1], ['trait', 'warm', 1]], note: 'Piety, paid for in coin.' },
    ],
  },
  {
    id: 'court', when: 'May, 1400', lesson: 'Favour',
    governess: 'At court every kindness is a debt and every debt is remembered. Choose whose company you keep, because others will choose for you by watching it.',
    text: 'Your mother takes you to Paris for a month, to the Hôtel Saint-Pol and the great houses around it. The king is well this spring, and the court is full. Three circles of ladies will receive a girl of good family. You can only be seen to belong to one.',
    choices: [
      { label: 'The queen\'s ladies', ops: [['fav', 'queen', 12], ['trust', 'friend', 10], ['use', 'queen', 5]], note: 'The way into the queen\'s household. Ysabel de Fontenoy takes you up.' },
      { label: 'The Duchess of Orléans\' household', ops: [['fav', 'arm', 12], ['trust', 'valentina', 10], ['use', 'valentina', 5]], note: 'Louis of Orléans is the rising power on the council.' },
      { label: 'The ladies of the Burgundian court', ops: [['fav', 'bur', 12], ['trust', 'margaret', 8], ['use', 'margaret', 5]], note: 'Philip of Burgundy is old, rich and still the greatest prince in France.' },
    ],
  },
  {
    id: 'servants', when: 'June, 1400', lesson: 'Information',
    governess: 'Know a thing before you act on it, and know who told you. A report is worth what its bearer is worth.',
    text: 'Back home, you want to know what the two men are like, and nobody is going to tell you. Someone could find out.',
    choices: [
      { label: 'Ask Perrette, your chamberwoman, to talk to their grooms', kind: 'source', via: 'maid', reports: 2, ops: [['trait', 'devout', -1]], note: 'Quick and cheap. Grooms exaggerate, and so might she.' },
      { label: 'Ask Brother Robert, who confesses half the county', kind: 'source', via: 'confessor', reports: 1, rep: 1, ops: [['trait', 'devout', 1]], note: 'Slow and discreet. He will tell you one true thing.' },
      { label: 'Write to Ysabel de Fontenoy at court', kind: 'source', via: 'friend', reports: 1, info: 10, ops: [['trait', 'warm', 1]], note: 'She knows their standing at court and the news besides.' },
    ],
  },
  {
    id: 'choice', when: 'August, 1400', lesson: 'Persuasion through others',
    governess: 'Your father decides. That is the law and the custom. But a wise woman knows that decisions are made by people, and people can be moved.',
    text: 'Your father leans toward {fatherPick}: {fatherWhy} Your mother asks you, privately, which match you would choose if you could.',
    choices: [
      { label: 'Tell her you would choose {A}', kind: 'prefer', pick: 0, ops: [['trait', 'bold', 1]] },
      { label: 'Tell her you would choose {B}', kind: 'prefer', pick: 1, ops: [['trait', 'bold', 1]] },
      { label: 'Tell her you will be content with your father\'s choice', kind: 'prefer', pick: null, ops: [['rep', 2], ['trust', 'mother', 8], ['trait', 'bold', -1]], note: 'Obedience is also a reputation.' },
    ],
  },
  {
    id: 'persuade', when: 'September, 1400', lesson: 'Persuasion through others',
    governess: 'Never ask for a thing yourself when someone he trusts can ask for it better. And never send someone who does not want it as much as you.',
    text: '{persuadeText}',
    choices: [
      { label: 'Let your mother speak to him', kind: 'persuade', via: 'mother', base: 0.45, ops: [['trait', 'warm', 1]] },
      { label: 'Ask Brother Robert to raise it in confession', kind: 'persuade', via: 'confessor', base: 0.4, rep: 2, ops: [['trait', 'devout', 1]] },
      { label: 'Ask {governess} to speak for you', kind: 'persuade', via: 'governess', base: 0.4 },
      { label: 'Go to him yourself', kind: 'persuade', via: 'self', base: 0.25, failRep: -4, ops: [['trait', 'bold', 2]], note: 'A daughter who argues is talked about.' },
    ],
  },
  {
    id: 'quarrel', when: 'October, 1400', lesson: 'Consequences arrive late',
    governess: 'What you do today, you will meet again in five years, wearing different clothes. Choose as if you will have to live beside it.',
    text: 'At the queen\'s court for the feast of Saint Denis, Ysabel de Fontenoy and Jacqueline d\'Aubercourt quarrel over who should walk first behind the queen\'s sister-in-law. Words are said. Both name you as a witness. You saw it all.',
    choices: [
      { label: 'Speak for Ysabel', ops: [['trait', 'warm', 1], ['trust', 'friend', 15], ['trust', 'rival', -10], ['flag', 'quarrel', 'ysabel'], ['later', '1402b', 'rival_grudge']], note: 'A friend made firmer, an enemy made. Jacqueline does not forget.' },
      { label: 'Speak for Jacqueline', ops: [['trait', 'warm', -1], ['trust', 'rival', 15], ['trust', 'friend', -12], ['flag', 'quarrel', 'jacqueline'], ['later', '1403a', 'rival_debt']], note: 'Jacqueline owes you, and she will remember it when it suits her.' },
      { label: 'Say you saw nothing', ops: [['trait', 'bold', -1], ['rep', 2], ['trust', 'friend', -5], ['trust', 'rival', -3], ['flag', 'quarrel', 'none'], ['later', '1402a', 'quarrel_none']], note: 'Discretion, and neither of them will forget it either.' },
    ],
  },
  {
    id: 'contract', when: 'December, 1400', lesson: 'The contract',
    governess: 'A marriage is a contract between two houses, and the contract is what protects you when the man does not. Read it. Have it read to you twice.',
    text: '{contractText}',
    choices: [
      { label: 'Sign, and ask for your dower to be assigned on named lands', ops: [['flag', 'renounced', true], ['flag', 'dowerAssigned', true], ['purse', -250, 'lawyers for the dower clause'], ['trait', 'bold', -1]], note: 'If you are widowed, nobody can argue about what is yours. You give up Brécourt, as daughters do.' },
      { label: 'Refuse to renounce your share of Brécourt', ops: [['flag', 'renounced', false], ['dowry', -300], ['trust', 'mother', 5], ['trait', 'bold', 1]], note: 'Your father is offended and the dowry shrinks by 300 livres. Your claim to Brécourt stays whole. Your mother says nothing, and squeezes your hand.' },
      { label: 'Sign, and ask your father for a larger dowry', kind: 'dowry', p: 0.5, ops: [['flag', 'renounced', true]], win: [['dowry', 600]], lose: [['rep', -3], ['trust', 'mother', -5]], note: 'More money for the new household, if he agrees. Your mother thinks it grasping.' },
      { label: 'Sign the terms as they stand', ops: [['flag', 'renounced', true], ['rep', 2], ['trust', 'mother', 4], ['trait', 'warm', 1]], note: 'Gracious, and cheaper than lawyers. You give up Brécourt, as daughters do.' },
    ],
  },
];

export const ACT1_LATE = {
  rival_grudge: { title: 'An old quarrel', text: 'Jacqueline d\'Aubercourt has not forgotten the feast of Saint Denis. Two of your letters to Ysabel have been read by someone else, and the queen\'s ladies are repeating a phrase from one of them.',
    choices: [
      { label: 'Laugh it off in company', ops: [['rep', -4]], note: 'Costs a little now.' },
      { label: 'Have Ysabel answer for you', ops: [['trust', 'friend', -6], ['rep', -1]], note: 'Spends your friend\'s patience.' },
      { label: 'Complain to the queen\'s mistress of the household', ops: [['fav', 'queen', -4], ['trust', 'rival', -10], ['use', 'rival', -10]], note: 'Jacqueline is reprimanded, and the queen thinks you tiresome.' },
    ] },
  rival_debt: { title: 'A debt called in', text: 'Jacqueline d\'Aubercourt reminds you that you spoke for her once. She asks you to recommend her cousin for a place in the queen\'s household.',
    choices: [
      { label: 'Recommend him', ops: [['trust', 'rival', 12], ['fav', 'queen', -3], ['use', 'rival', 6]], note: 'She is grateful, for now. The queen notices the favour.' },
      { label: 'Refuse politely', ops: [['trust', 'rival', -15]], note: 'Now she owes you nothing, and knows it.' },
    ] },
  quarrel_none: { title: 'The witness who saw nothing', text: 'At a christening you find yourself seated between Ysabel de Fontenoy and Jacqueline d\'Aubercourt. Neither has forgiven you for seeing nothing, but both of them still need you.',
    choices: [
      { label: 'Be charming to both', ops: [['trust', 'friend', 4], ['trust', 'rival', 4], ['purse', -60, 'christening gifts']], note: 'Costs a christening gift each.' },
      { label: 'Leave early', ops: [['rep', 1]], note: 'Nothing lost, nothing mended.' },
    ] },
};
