// Story beats: her own story inside the fixed history (docs/FRAME-DEPTH.md).
// Logic-free: conditions and effects are data (src/engine/cond.js, effects.js).
//
// A beat fires at most once, in its window [from, until], when its conditions
// hold and every earlier beat of the same arc has fired or been passed by. At
// most one beat a half-year (two if both are on their last chance); the spine
// first. A beat that misses its window is skipped, and its onSkip effects apply.
//
// text: a string, or a list of parts {if, text} joined in order: the parts that
// hold are the paragraph. Tokens: {lady} {husband} {cousin} {son} {child}
// {mother} {year}. Choices: ops; or kind 'chance' with p (a number, or
// {base, trust, fav, rep, bold, brecourt}) and win/lose; show (hidden unless it
// holds); need + why (shown but closed unless it holds).
//
// The places, the cousin and every invented person are invented. The custom of
// the Beauvaisis is real: Philippe de Beaumanoir wrote it down in the 1280s.

export const ARCS = {
  brecourt: { title: 'Brécourt', spine: true },
  husband: { title: 'Your husband' },
  ysabel: { title: 'Ysabel' },
  jacqueline: { title: 'Jacqueline' },
  her: { title: 'Your own life' },
};

export const BEATS = [
  // ---- THE SPINE: BRÉCOURT -------------------------------------------------
  {
    id: 'father_ill', arc: 'brecourt', from: '1402b', until: '1403a', title: 'Your father is ill',
    text: `A letter from your mother, written by the steward because her own hand shakes: your father has taken to his bed at Brécourt, coughs blood in the mornings, and has asked for you twice. It is four days' ride into the Beauvaisis in November. {husband} says the roads will be mud to the axles, and that he cannot spare the horses.`,
    choices: [
      { label: 'Ride to Brécourt yourself', note: 'Mud, cold, four days. You will be at his bedside.', ops: [['health', -6], ['purse', -60, 'the road to Brécourt'], ['trust', 'mother', 10], ['flag', 'fatherSeen', true], ['trait', 'warm', 1], ['regard', -2]] },
      { label: 'Send Brother Robert with a letter', note: 'He will hear your father\'s confession, and what else your father wants said.', ops: [['trust', 'confessor', 5], ['flag', 'robertWitness', true]] },
      { label: 'Write to him, and stay', note: 'The roads are bad. Your husband is right about the horses.', ops: [['trust', 'mother', -10], ['trait', 'warm', -1], ['regard', 2]] },
    ],
  },
  {
    id: 'father_dead', arc: 'brecourt', from: '1403a', until: '1403b', title: 'Brécourt',
    text: [
      { if: ['flag', 'fatherSeen'], text: `He knew you. In the last week he had you sit by the bed with the charter chest open and told you, slowly, which parchments were there and which were not. "Gérard will come," he said. "He has been coming for ten years." He died on the feast of Saint John, with your hand in his.` },
      { if: ['flag', 'robertWitness'], text: `Brother Robert came back from Brécourt with your father's last wishes written down and witnessed by the parish priest: Brécourt was to go to you and to your children. Your father died a week after he signed it.` },
      { if: ['all', [['not', ['flag', 'fatherSeen']], ['not', ['flag', 'robertWitness']]]], text: `He died on the feast of Saint John. You learned it from a carter, three days late.` },
      { if: ['flag', 'renounced'], text: `Within the month your cousin, Gérard de Brécourt, a knight of the Duke of Burgundy's household, rode in with twelve men and a copy of your marriage contract, open at the clause where you renounced any part of your father's lands in return for your dowry. Your mother was given a day to leave.` },
      { if: ['not', ['flag', 'renounced']], text: `Within the month your cousin, Gérard de Brécourt, a knight of the Duke of Burgundy's household, rode in with twelve men. He has no clause to show: you never signed one. He says a fief is no place for a woman, and that the Duke agrees. Your mother was given a day to leave.` },
    ],
    choices: [
      { label: 'Take your mother into your own household', note: 'She will have a roof and you will have her counsel. She has opinions about your kitchens.', ops: [['purse', -150, 'your mother\'s household'], ['trust', 'mother', 15], ['flag', 'motherWithYou', true], ['hh', -5], ['trait', 'warm', 1]] },
      { label: 'Open a case against Gérard in the Parlement of Paris', note: 'Slow, expensive, and the only court that can make a duke\'s knight give anything back. Press it with your procureur, half-year by half-year.', ops: [['flag', 'caseBrecourt', true], ['purse', -150, 'the procureur\'s retainer'], ['trait', 'bold', 1]] },
      { label: 'Ask the Duke of Berry to speak to Gérard\'s lord', need: ['trust', 'berry', '>=', 25], why: 'The Duke of Berry does not know you well enough (trust 25).', kind: 'chance', p: { base: 0.35, trust: 'berry' }, win: [['flag', 'motherDowerPaid', true], ['trust', 'mother', 10], ['use', 'berry', 5], ['oweTo', 'berry', 1, 'his word to Gérard\'s lord']], lose: [['trust', 'berry', -5]], note: 'Berry is the king\'s uncle and owes nobody. If he speaks, your mother\'s dower at least is paid.' },
    ],
  },
  {
    id: 'brecourt_wedding', arc: 'brecourt', from: '1404a', until: '1404b', title: 'A wedding at Brécourt',
    text: [
      { text: `Jacqueline d'Aubercourt is to marry your cousin Gérard in your father's chapel at Brécourt, at Pentecost. The invitation is in her own hand, which is very fine. "We should be so glad to see you in the house where you were a girl."` },
      { if: ['flag', 'quarrel', 'ysabel'], text: `She has not forgotten the feast of Saint Denis. Neither have you.` },
      { if: ['flag', 'quarrel', 'jacqueline'], text: `You spoke for her once, at the feast of Saint Denis. This is how she thanks you.` },
    ],
    choices: [
      { label: 'Go, and be gracious', note: 'The county will see a lady who knows how to lose. Jacqueline will see a loser.', ops: [['rep', 3], ['trust', 'rival', -5], ['trait', 'warm', 1], ['purse', -80, 'a wedding gift for Brécourt']] },
      { label: 'Refuse, and say why', note: 'Your mother will love you for it. Jacqueline will keep the letter.', ops: [['trust', 'mother', 6], ['trust', 'rival', -12], ['flag', 'snubbedWedding', true], ['trait', 'bold', 1]] },
      { label: 'Go, wearing your father\'s ring', show: ['flag', 'fatherSeen'], need: ['trait', 'bold', '>=', 1], why: 'Only a bold woman wears it into his hall (bold 1).', note: 'Gérard claims the ring as Brécourt\'s. Your father put it on your hand himself. The whole hall will see whose it is.', ops: [['rep', 2], ['use', 'rival', -10], ['flag', 'gerardShamed', true], ['trait', 'bold', 1], ['purse', -80, 'a wedding gift for Brécourt']] },
    ],
  },
  {
    id: 'mother_dower', arc: 'brecourt', from: '1405b', until: '1406b', title: 'Your mother\'s dower', if: [['alive', 'mother'], ['not', ['flag', 'motherDowerPaid']]],
    text: [
      { text: `Your mother's dower, the use for her life of half the lands your father held when they married, as the custom of the Beauvaisis gives every widow, has not been paid since Michaelmas. Gérard's steward writes that the lands were burdened with your father's debts.` },
      { text: `"Your father had no debts," your mother says. "He had me." She is fifty-one and has never asked you for anything.` },
      { if: ['flag', 'motherWithYou'], text: `She says it at your own table, in front of the servants.` },
    ],
    choices: [
      { label: 'Join her claim to a case in the Parlement', note: 'Her dower and your inheritance argued together. Your procureur will need more hearings, and more money.', ops: [['flag', 'caseBrecourt', true], ['flag', 'motherCase', true], ['purse', -120, 'the procureur, for your mother'], ['trust', 'mother', 10]] },
      { label: 'Pay her what Gérard owes, from your own purse', note: 'She will live as she should. Gérard will learn that the debt can be left with you.', ops: [['purse', -350, 'your mother\'s dower'], ['trust', 'mother', 12], ['rep', 2], ['trait', 'warm', 1]] },
      { label: 'Tell her to make terms with him', note: 'He will offer a third. She will take it, and not forgive you.', ops: [['trust', 'mother', -18], ['flag', 'motherTerms', true], ['trait', 'warm', -1]] },
    ],
  },
  {
    id: 'witness', arc: 'brecourt', from: '1409a', until: '1411b', title: 'A witness', if: [['flag', 'caseBrecourt']],
    text: [
      { text: `Master Lorfèvre writes from the Palais: the case needs a witness to your father's intentions, and the Parlement does not take a daughter's word. Old Thibaut, your father's steward for thirty years, was turned out by Gérard and is said to be living with a niece somewhere in Beauvais. Gérard's men are said to be looking for him too.` },
      { if: ['flag', 'robertWitness'], text: `You have Brother Robert's written statement of your father's last wishes. A friar's word counts for something. A steward's would count for more.` },
    ],
    choices: [
      { label: 'Send Perrette to find him', kind: 'chance', via: 'maid', p: { base: 0.2, rel: 'maid' }, win: [['flag', 'witnessThibaut', true], ['count', 'brecourtHearings', 1]], lose: [['flag', 'thibautLost', true]], note: 'Servants find servants. If she is slow, Gérard finds him first.' },
      { label: 'Ride to Beauvais yourself', need: ['trait', 'bold', '>=', 1], why: 'A careful woman does not ride into Gérard\'s county (bold 1).', kind: 'chance', p: 0.7, win: [['flag', 'witnessThibaut', true], ['count', 'brecourtHearings', 1], ['health', -5]], lose: [['flag', 'thibautLost', true], ['health', -5]], note: 'Five days on the road. Thibaut taught you to ride.' },
      { label: 'Rest the case on Brother Robert\'s statement', show: ['flag', 'robertWitness'], ops: [['flag', 'witnessRobert', true], ['trust', 'confessor', 5]], note: 'Safer. Weaker.' },
      { label: 'Let it lie for now', ops: [], note: 'The case waits. So does Gérard.' },
    ],
  },
  {
    id: 'mother_death', arc: 'brecourt', from: '1410b', until: '1412b', title: 'Your mother', if: [['alive', 'mother']],
    text: [
      { text: `Your mother died in the winter, of a cold that went to her chest, with her rosary in one hand and her household accounts, balanced to the denier, on the table beside her.` },
      { if: ['flag', 'motherWithYou'], text: `She died in your house. In her last week she told your steward he was a thief, kindly, and he wept.` },
      { if: ['flag', 'motherTerms'], text: `She died in her dower house, on the third Gérard allowed her. She had not written to you since the summer.` },
      { text: `She asked to lie beside your father in the chapel at Brécourt. The chapel is Gérard's now.` },
    ],
    choices: [
      { label: 'Ask Gérard to let her lie beside your father', kind: 'chance', p: { base: 0.3, trust: 'rival' }, win: [['rep', 2], ['trust', 'rival', 5], ['flag', 'motherAtBrecourt', true]], lose: [['rep', -1], ['trust', 'rival', -5], ['flag', 'gerardRefusedBurial', true]], ops: [['gone', 'mother', 'died in the winter']], note: 'He may refuse, to make a point. Jacqueline may persuade him not to.' },
      { label: 'Bury her in your own parish church', ops: [['gone', 'mother', 'died in the winter'], ['purse', -100, 'your mother\'s funeral'], ['trust', 'confessor', 4]], note: 'Close to you, far from him.' },
    ],
    onSkip: [['gone', 'mother', 'died']],
  },
  {
    id: 'gerard_falls', arc: 'brecourt', from: '1413b', until: '1414a', title: 'Gérard in the Châtelet',
    text: [
      { text: `Gérard was with the Duke of Burgundy at the Hôtel d'Artois until the last week of August. Now the duke has fled to Flanders, Gérard is in the Châtelet, and the Armagnac council is drawing up lists of Burgundian lands to give to its friends. Brécourt is on the list.` },
      { text: `Master Lorfèvre comes in person, which he never does. "A word from you now, Madame, and it goes to whoever asks loudest. It could be you. Or I can ask the Parlement to judge the case while Gérard cannot bribe anyone."` },
      { if: ['flag', 'gerardShamed'], text: `He adds: "He has not forgotten the ring."` },
    ],
    choices: [
      { label: 'Ask the council for Brécourt', need: ['fav', 'arm', '>=', 35], why: 'You need friends on the Armagnac council (Armagnac favour 35).', note: 'Quick, certain, and taken from a man in prison. It will last exactly as long as the Armagnacs do.', ops: [['flag', 'brecourt', 'seized'], ['lands', 3], ['flag', 'denouncedGerard', true], ['rep', -3], ['trust', 'rival', -30], ['trait', 'warm', -1]] },
      { label: 'Ask the Parlement to judge it now, on its merits', kind: 'chance', p: { brecourt: true }, win: [['flag', 'brecourt', 'judged'], ['lands', 3], ['rep', 3]], lose: [['flag', 'brecourt', 'refused'], ['rep', -1]], show: ['flag', 'caseBrecourt'], note: 'A judgment outlasts a council. Your chance depends on the hearings pressed, the witnesses found and what you signed in 1400.' },
      { label: 'Do nothing while a man is in prison', note: 'His wife and children are still at Brécourt. You have been where they are.', ops: [['flag', 'spareGerard', true], ['trust', 'rival', 15], ['trait', 'warm', 1], ['trait', 'devout', 1]] },
    ],
  },
  {
    id: 'gerard_returns', arc: 'brecourt', from: '1418a', until: '1418b', title: 'Gérard comes back',
    text: [
      { text: `Gérard came back into Paris with the Burgundians at the end of May, on a borrowed horse, thinner and without his left hand's two last fingers.` },
      { if: ['flag', 'brecourt', 'seized'], text: `The new council has undone every grant the Armagnacs made. Brécourt is his again by the end of June, and he has asked the council for one more thing: you.` },
      { if: ['flag', 'brecourt', 'judged'], text: `The Parlement that judged for you has been purged; half its counsellors are dead or in Poitiers with the Dauphin. Gérard's procureur has already filed to have the judgment set aside.` },
      { if: ['flag', 'mercyJacqueline'], text: `A note comes from Jacqueline, unsigned, in her very fine hand: "He wanted more. I told him we were even. We are even."` },
      { if: ['flag', 'spareGerard'], text: `He has not forgotten that you did nothing when you could have ruined him. He sends a cask of Brécourt wine, which is as near as he can come to saying so.` },
    ],
    choices: [
      { label: 'Let him have it', show: ['any', [['flag', 'brecourt', 'seized'], ['flag', 'brecourt', 'judged']]], note: 'You keep your head and lose your father\'s house.', ops: [['flag', 'brecourt', 'lost'], ['lands', -3], ['trait', 'bold', -1]] },
      { label: 'Fight the appeal before the new Parlement', show: ['flag', 'brecourt', 'judged'], kind: 'chance', p: { base: 0.15, fav: 'bur', trust: 'rival' }, win: [['rep', 4]], lose: [['flag', 'brecourt', 'lost'], ['lands', -3], ['purse', -200, 'the appeal']], note: 'A Burgundian Parlement, a Burgundian claimant. You would need Burgundian friends, or Jacqueline.' },
      { label: 'Go to Margaret of Burgundy for protection', show: ['flag', 'brecourt', 'seized'], need: ['fav', 'bur', '>=', 40], why: 'The duchess does not know you well enough (Burgundy favour 40).', note: 'The duchess dislikes vengeful men in her husband\'s council.', ops: [['flag', 'brecourt', 'lost'], ['lands', -3], ['swingMod', '1420a', 0.6, 'The Duchess of Burgundy remembers you asked her for protection.']] },
      { label: 'Write him a letter, and let it go', show: ['not', ['any', [['flag', 'brecourt', 'seized'], ['flag', 'brecourt', 'judged']]]], note: 'He holds Brécourt, as he has for fifteen years. You can at least tell him what you think of it.', ops: [['trait', 'bold', 1]] },
    ],
  },
  {
    id: 'brecourt_end', arc: 'brecourt', from: '1420b', until: '1422a', title: 'The end of the matter',
    text: [
      { if: ['flag', 'brecourt', 'judged'], text: `Brécourt is yours by judgment of the Parlement, and has stayed yours through two councils and a treaty. Gérard is old and has given up. Jacqueline writes to ask whether there might be peace between the houses before you are both dead.` },
      { if: ['all', [['not', ['flag', 'brecourt', 'judged']], ['trust', 'rival', '>=', 40]]], text: `Gérard holds Brécourt, and is old. Jacqueline writes to propose the oldest settlement there is: her eldest for yours, and Brécourt to their children. "Our grandchildren," she writes, "will not know there was a quarrel."` },
      { if: ['all', [['not', ['flag', 'brecourt', 'judged']], ['trust', 'rival', '<', 40]]], text: `Gérard holds Brécourt, and is old. His procureur writes, not Jacqueline: Gérard would consider a marriage between his eldest and yours, Brécourt to their children, on payment of two thousand five hundred livres "for the burdens of the estate". Jacqueline, it seems, has nothing to say to you.` },
      { if: ['flag', 'revengeJacqueline'], text: `She has not forgotten the door you closed in 1413.` },
    ],
    choices: [
      { label: 'Agree: a betrothal, and Brécourt to their children', show: ['trust', 'rival', '>=', 40], need: ['children', '>=', 1], why: 'You need a living child to promise.', note: 'Your blood back in your father\'s hall within a generation, on a contract.', ops: [['flag', 'brecourt', 'shared'], ['betrothEldest', 'the lord of Brécourt', 2, 'bur'], ['trust', 'rival', 20], ['rep', 3], ['trait', 'warm', 1]] },
      { label: 'Pay his price: the betrothal, and Brécourt to their children', show: ['all', [['not', ['flag', 'brecourt', 'judged']], ['trust', 'rival', '<', 40]]], need: ['all', [['children', '>=', 1], ['money', '>=', 2500]]], why: 'You need a living child to promise, and 2,500 livres.', note: 'Peace, bought. Your grandchildren will hold Brécourt; your children will inherit less.', ops: [['purse', -2500, 'Gérard\'s price for Brécourt'], ['flag', 'brecourt', 'shared'], ['betrothEldest', 'the lord of Brécourt', 2, 'bur'], ['trait', 'warm', -1]] },
      { label: 'Keep it all for your own children', show: ['flag', 'brecourt', 'judged'], note: 'It is yours. Let them wait for you to die.', ops: [['trust', 'rival', -10], ['trait', 'warm', -1]] },
      { label: 'Refuse. You would rather it went to strangers than to them.', show: ['not', ['flag', 'brecourt', 'judged']], note: 'Pride costs nothing you still have.', ops: [['flag', 'brecourt', 'given'], ['trait', 'bold', 1], ['trait', 'warm', -1]] },
      { label: 'Let it go, and pray for them', show: ['not', ['flag', 'brecourt', 'judged']], note: 'There are other things to leave your children.', ops: [['flag', 'brecourt', 'given'], ['trait', 'devout', 1], ['rep', 2]] },
    ],
  },

  // ---- HER HUSBAND ----------------------------------------------------------
  {
    id: 'first_winter', arc: 'husband', from: '1401b', until: '1402a', title: 'The first winter', if: [['husband', 'first'], ['husband', 'present']],
    text: [
      { text: `Your first winter in his house. {husband} rises before light, hears mass, eats standing up and is gone until dark: horses, tenants, his lord's business.` },
      { if: ['temper', '>=', 4], text: `He shouts at the grooms. Once, last week, he shouted at you, and then left the room as if he had embarrassed himself.` },
      { if: ['spending', '>=', 4], text: `His tailor comes twice a month, and is paid less often.` },
      { if: ['spending', '<=', 2], text: `He checks the candle ends.` },
      { text: `Tonight, by the fire, he asks what you did all day, in the voice of a man who expects nothing much.` },
    ],
    choices: [
      { label: 'Tell him plainly what the household needs', show: ['temper', '<', 4], note: 'He wanted a wife; he may find he has a partner.', ops: [['regard', 10], ['heed', 5], ['trait', 'bold', 1]] },
      { label: 'Tell him plainly what the household needs', show: ['temper', '>=', 4], kind: 'chance', p: 0.5, win: [['regard', 14], ['heed', 6]], lose: [['regard', -8]], ops: [['trait', 'bold', 1]], note: 'He may hear it as advice. He may hear it as a reproach.' },
      { label: 'Ask about his day, and listen', note: 'Men talk to women who listen. Sometimes they say something useful.', ops: [['regard', 5], ['heed', 8], ['info', 4], ['trait', 'warm', 1]] },
      { label: 'Say little. The house is your business, not his.', note: 'Peace at the fireside, and a stranger in your bed.', ops: [['regard', -3], ['heed', -5], ['trait', 'bold', -1], ['trait', 'warm', -1]] },
    ],
  },
  {
    id: 'his_money', arc: 'husband', from: '1403a', until: '1404a', title: 'Your dowry plate', if: [['husband', 'first'], ['husband', 'alive'], ['spending', '>=', 3]],
    text: `The goldsmith's man again, and this time the letter is addressed to you: {husband} has pledged the silver that came with your dowry, the ewer and the six cups with your mother's arms, against a debt of two hundred and fifty livres. The goldsmith thought you would want to know before he melts them.`,
    choices: [
      { label: 'Confront him', kind: 'chance', p: { base: 0.3, regard: true }, win: [['regard', 8], ['heed', 6], ['spending', -1], ['flag', 'husbandReformed', true]], lose: [['regard', -10]], ops: [['trait', 'bold', 1]], note: 'If he respects you, he will be ashamed. If not, he will be angry.' },
      { label: 'Redeem it quietly from the household purse', note: 'He will never mention it. Neither will you.', ops: [['purse', -250, 'redeeming your dowry plate'], ['regard', 4], ['trait', 'warm', 1]] },
      { label: 'Let it be melted', note: 'It is only silver. Your mother will ask about it at Easter.', ops: [['trust', 'mother', -6], ['trait', 'devout', -1]] },
    ],
  },
  {
    id: 'melun', arc: 'husband', from: '1405a', until: '1405b', title: 'Two letters', if: [['husband', 'first'], ['husband', 'present']],
    text: [
      { text: `August 1405. The Duke of Burgundy's army is at the gates of Paris, the queen and the Duke of Orléans have gone to Melun, and {husband} has been summoned by both. He sits on the end of the bed with a letter in each hand, one sealed in red and one in green.` },
      { text: `"Tell me which," he says. "You hear more than I do."` },
      { if: ['regard', '<', 30], text: `It is the first time he has asked you anything.` },
    ],
    choices: [
      { label: 'Orléans', note: 'The king\'s brother, the queen\'s friend, the rising power.', ops: [['lean', 'arm'], ['fav', 'arm', 6], ['regard', 6], ['heed', 6]] },
      { label: 'Burgundy', note: 'The richest prince in Christendom, and Paris loves him.', ops: [['lean', 'bur'], ['fav', 'bur', 6], ['regard', 6], ['heed', 6]] },
      { label: 'Neither. Send word that he is ill.', note: 'Neither side will thank him. Neither will hang him.', ops: [['lean', 'none'], ['regard', 3], ['heed', 4], ['trait', 'bold', -1]] },
      { label: '"You decide. It is your name."', note: 'He will go where his friends go.', ops: [['regard', -3], ['trait', 'bold', -1]] },
    ],
  },
  {
    id: 'jean_petit', arc: 'husband', from: '1408a', until: '1408a', title: 'After the justification', if: [['husband', 'first'], ['husband', 'alive']],
    text: [
      { text: `{husband} comes home from the Hôtel Saint-Pol after four hours of Master Jean Petit proving from Scripture and Aristotle that the murder of the Duke of Orléans was a lawful act.` },
      { if: ['lean', 'bur'], text: `"He made it sound like justice," he says, pulling off his boots. "Perhaps it was."` },
      { if: ['lean', 'arm'], text: `"They applauded," he says. "Louis is four months in the ground, and they applauded." He has not taken off his sword.` },
      { if: ['lean', 'none'], text: `"Everyone watched everyone else to see when to clap," he says. "I clapped when the Duke of Berry did."` },
    ],
    choices: [
      { label: 'Agree with him', note: 'He needs someone to.', ops: [['regard', 5], ['trait', 'warm', 1]] },
      { label: 'Tell him murder is murder, whatever Aristotle says', note: 'He may admire it. He will certainly repeat it in the wrong company.', ops: [['regard', 3], ['trait', 'devout', 1], ['trait', 'bold', 1], ['flag', 'saidMurder', true], ['fav', 'bur', -4]] },
      { label: 'Ask him to say nothing outside this room, to anyone', note: 'This is a year for silence.', ops: [['heed', 6], ['trait', 'bold', -1]] },
    ],
  },
  {
    id: 'war_letter', arc: 'husband', from: '1411b', until: '1412b', title: 'A letter from the army', if: [['husband', 'first'], ['husband', 'alive'], ['not', ['lean', 'none']]],
    text: [
      { if: ['lean', 'bur'], text: `A letter from {husband}, from the king's army before Bourges, where the Duke of Burgundy has the king besieging the king's own uncle. "The water is bad and the heat is worse. The Gascons in the town shout at us from the walls; I understand one word in three. Kiss the children. Tell me what the queen is saying."` },
      { if: ['lean', 'arm'], text: `A letter from {husband}, from the Armagnac camp somewhere south of the Loire, in a clerk's hand with his own at the bottom. "We are told the English are coming to help us, which is a sentence I never thought to write. The water is bad. Kiss the children. Tell me what Paris is saying."` },
    ],
    choices: [
      { label: 'Write back everything you hear at court', note: 'He will know more than his captains. So will anyone who opens the letter.', ops: [['heed', 8], ['regard', 4], ['info', -5]] },
      { label: 'Write about the children and the harvest', note: 'What he will read twice.', ops: [['regard', 8], ['trait', 'warm', 1]] },
      { label: 'Send money and a short note', note: 'Armies eat purses.', ops: [['purse', -150, 'money for your husband in the field'], ['regard', 2]] },
    ],
  },
  {
    id: 'agincourt_eve', arc: 'husband', from: '1415a', until: '1415a', title: 'The summons', if: [['husband', 'first'], ['husband', 'present']],
    text: [
      { text: `The English king is at Harfleur, and the summons has come to every man of birth in the north. {husband} is in the yard cleaning his own harness, which he has never done in fourteen years of marriage.` },
      { if: ['regard', '>=', 60], text: `When you come out he puts the cloth down and says, "Well. You had better tell me what you think."` },
      { if: ['regard', '<', 60], text: `He does not look up when you come out.` },
    ],
    choices: [
      { label: 'Ask him not to go', kind: 'stay', p: { base: 0.05, regard: true, heedOnly: true }, note: 'The king has summoned him. Staying will cost him his name. Going may cost him everything else.' },
      { label: 'Help him arm, and say nothing', note: 'He will remember that you did not make it harder.', ops: [['regard', 10], ['flag', 'blessing', true]] },
      { label: 'Give him something of yours to carry', note: 'A ribbon, a little book of hours. Men carry them into battle.', ops: [['regard', 8], ['flag', 'token', true], ['trait', 'warm', 1]] },
    ],
  },
  {
    id: 'after_agincourt', arc: 'husband', from: '1415b', until: '1416b', title: 'After Agincourt', if: [['flag', 'agincourt'], ['not', ['flag', 'remarried']]],
    text: [
      { if: ['agincourt', 'killed'], text: `His squire brought back his sword, his seal ring and his horse, which was not hurt.` },
      { if: ['all', [['agincourt', 'killed'], ['flag', 'token']]], text: `And your ribbon, which he had tied inside his gauntlet, and which you will not describe.` },
      { if: ['agincourt', 'killed'], text: `The heralds buried most of the dead in pits by the field. His squire says he can find the place.` },
      { if: ['agincourt', 'captured'], text: `A letter from England, in an English clerk's French, with {husband}'s own signature shaking at the bottom. He is held in a castle in the north, well fed, cold, and priced. He asks after the children by name.` },
      { if: ['all', [['agincourt', 'captured'], ['flag', 'token']]], text: `"I have your ribbon still," he writes. "They let me keep it."` },
      { if: ['agincourt', 'survived'], text: `{husband} came home on foot, without his horse or his banner, and has not said one word about the battle. He sleeps badly and gets up to walk the yard.` },
      { if: ['agincourt', 'absent'], text: `{husband} stayed home. Men who lost sons at Agincourt cross the street to avoid him, and he has started to cross first.` },
    ],
    choices: [
      { label: 'Bring him home to lie with his fathers', show: ['agincourt', 'killed'], note: 'A cart, a priest and a fortnight on the roads of a beaten country.', ops: [['purse', -250, 'bringing your husband home'], ['rep', 4], ['trait', 'devout', 1]] },
      { label: 'Let him lie with the others, where he fell', show: ['agincourt', 'killed'], note: 'There is no shame in it. Half the nobility of the north is there.', ops: [['trait', 'devout', -1]] },
      { label: 'Write to him every month', show: ['agincourt', 'captured'], note: 'Letters from home keep a prisoner alive. And the English read them.', ops: [['regard', 10], ['trait', 'warm', 1]] },
      { label: 'Borrow against the ransom from a Lombard banker', show: ['agincourt', 'captured'], note: 'Two thousand livres now from a Lucchese house in the rue des Lombards, twenty-six hundred to repay in two years, witnessed by a notary. Nobody lends to a wife without asking where her husband is.', ops: [['purse', 2000, 'a loan from the Lombards'], ['loan', 2600, 4], ['trait', 'bold', 1]] },
      { label: 'Write to the Duke of Burgundy about his ransom', show: ['agincourt', 'captured'], need: ['fav', 'bur', '>=', 35], why: 'You need the duke\'s people to know you (Burgundy favour 35).', note: 'Burgundy talks to the English. A word from him takes a third off the price.', ops: [['ransomCut', 0.3], ['flag', 'ransomHelp', true], ['fav', 'bur', -5], ['oweTo', 'margaret', 2, 'a third off your husband\'s ransom']] },
      { label: 'Sit up with him, and let him talk when he wants', show: ['any', [['agincourt', 'survived'], ['agincourt', 'absent']]], note: 'Months. Maybe never.', ops: [['regard', 12], ['heed', 6], ['trait', 'warm', 1]] },
      { label: 'Leave him to it. Men mend by themselves.', show: ['any', [['agincourt', 'survived'], ['agincourt', 'absent']]], note: 'Some do.', ops: [['regard', -4]] },
    ],
  },

  // ---- YSABEL ---------------------------------------------------------------
  {
    id: 'ysabel_dice', arc: 'ysabel', from: '1402a', until: '1403b', title: 'Ysabel at the tables', if: [['alive', 'friend'], ['trust', 'friend', '>=', 20]],
    text: `Ysabel de Fontenoy finds you in the gallery of the Hôtel Barbette with her face arranged and her hands not. "Two hundred livres, by Sunday. I lost it at the queen's tables to the Count of Saint-Pol's man, who will tell everyone if I don't pay. If the queen hears, I am sent home to my father. My father is worse than the queen."`,
    choices: [
      { label: 'Lend it', note: 'She will owe you. People do not always like that.', ops: [['purse', -200, 'a loan to Ysabel'], ['trust', 'friend', 12], ['use', 'friend', 10], ['flag', 'ysabelOwes', true], ['owe', 'friend', 2, 'the two hundred livres from the queen\'s tables']] },
      { label: 'Lend it, if she swears on the relics never to play again', note: 'She will swear. Whether she keeps it is another matter.', ops: [['purse', -200, 'a loan to Ysabel'], ['trust', 'friend', 6], ['flag', 'ysabelOwes', true], ['owe', 'friend', 2, 'the two hundred livres from the queen\'s tables'], ['flag', 'ysabelSworn', true], ['trait', 'devout', 1]] },
      { label: 'Refuse', note: 'Two hundred livres is two hundred livres.', ops: [['trust', 'friend', -14], ['trait', 'warm', -1]] },
    ],
  },
  {
    id: 'ysabel_song', arc: 'ysabel', from: '1405b', until: '1406b', title: 'A song in the kitchens', if: [['alive', 'friend'], ['trust', 'friend', '>=', 25]],
    text: [
      { text: `A song is going round the kitchens of the Hôtel Saint-Pol about a lady of the queen's household and a squire of the Duke of Orléans' stable. Nobody names her. Everybody knows. Ysabel comes to you white and very calm.` },
      { text: `"Say I was with you on the night of Saint Martin. I was not. Say it anyway."` },
      { if: ['flag', 'ysabelSworn'], text: `You notice she does not swear on anything this time.` },
    ],
    choices: [
      { label: 'Swear to it', kind: 'chance', p: 0.7, win: [['trust', 'friend', 20], ['flag', 'ysabelAlibi', true]], lose: [['rep', -8], ['trust', 'friend', 10], ['flag', 'lieFound', true]], ops: [['trait', 'warm', 1], ['trait', 'devout', -1]], note: 'If anyone saw you at home that night, you are a liar in front of the queen.' },
      { label: 'Speak to the queen\'s mistress of the household for her, without lying', need: ['fav', 'queen', '>=', 35], why: 'You need standing in the queen\'s household (queen\'s favour 35).', note: 'A good word, not an alibi. It may be enough.', ops: [['trust', 'friend', 10], ['fav', 'queen', -3]] },
      { label: 'Keep out of it', note: 'Songs pass. So do friends.', ops: [['trust', 'friend', -15], ['rep', 1], ['trait', 'bold', -1]] },
    ],
  },
  {
    id: 'ysabel_letter', arc: 'ysabel', from: '1408a', until: '1408a', title: 'A letter for the duchess', if: [['alive', 'friend'], ['alive', 'valentina'], ['trust', 'friend', '>=', 35]],
    text: `Ysabel presses a letter into your hand in the chapel, under cover of the offertory. It is sealed with plain wax. "For the Duchess of Orléans, from friends of her husband in the queen's household. Names, dates, who paid the men in the Rue Vieille-du-Temple. I cannot be seen near her people. You hear mass at the Celestines; so does her almoner."`,
    choices: [
      { label: 'Carry it yourself', kind: 'chance', p: 0.75, win: [['fav', 'arm', 10], ['trust', 'valentina', 15], ['trust', 'friend', 10], ['flag', 'carriedLetter', true]], lose: [['fav', 'arm', 6], ['fav', 'bur', -15], ['trust', 'friend', 10], ['flag', 'carriedLetter', true], ['flag', 'seenWithLetter', true], ['swingMod', '1413a', 1.4, 'Someone remembered seeing you with the Duchess of Orléans\' almoner in 1408.']], ops: [['trait', 'bold', 1]], note: 'If a Burgundian sees you with the almoner, you are on a list.' },
      { label: 'Have Brother Robert carry it', kind: 'chance', via: 'confessor', p: { base: 0.3, rel: 'confessor' }, win: [['fav', 'arm', 6], ['trust', 'friend', 6], ['flag', 'carriedLetter', true]], lose: [['trust', 'friend', -5], ['trust', 'confessor', -5]], note: 'A friar at the Celestines is invisible. Unless he is frightened.' },
      { label: 'Give it back to her', note: 'This is how people end up in the river.', ops: [['trust', 'friend', -12], ['trait', 'bold', -1]] },
    ],
  },
  {
    id: 'ysabel_cabochiens', arc: 'ysabel', from: '1413a', until: '1413b', title: 'Ysabel in the Châtelet', if: [['alive', 'friend']],
    text: [
      { text: `The white hoods came into the queen's house in May with a list, and took the queen's brother and eleven of her ladies through the streets to the Châtelet. Ysabel's name was on the list.` },
      { if: ['flag', 'carriedLetter'], text: `So, Perrette says, was something about a letter to the Celestines. Your name was not. Yet.` },
      { if: ['flag', 'seenWithLetter'], text: `And somebody among the butchers remembers a lady with the Duchess of Orléans' almoner at the Celestines, in the spring of 1408.` },
      { if: ['flag', 'ysabelOwes'], text: `She still owes you two hundred livres from the queen's tables. You find you do not care.` },
      { text: `The butchers are talking about trials.` },
    ],
    choices: [
      { label: 'Pay her keepers', kind: 'chance', p: 0.65, win: [['flag', 'ysabelFreed', true], ['trust', 'friend', 20], ['owe', 'friend', 3, 'the Châtelet']], lose: [['trust', 'friend', 5]], ops: [['purse', -300, 'the keepers of the Châtelet']], note: 'Gaolers are paid badly and bribed well. Not always.' },
      { label: 'Ask Jacqueline to speak to her husband\'s friends', need: ['any', [['trust', 'rival', '>=', 35], ['fav', 'bur', '>=', 45]]], why: 'You need Jacqueline\'s goodwill (trust 35) or Burgundian friends (favour 45).', note: 'The butchers are Burgundy\'s men. Jacqueline is Burgundy\'s woman. She will want something for it.', ops: [['flag', 'ysabelFreed', true], ['trust', 'friend', 22], ['trust', 'rival', -10], ['flag', 'owesJacqueline', true], ['owe', 'friend', 3, 'the Châtelet'], ['oweTo', 'rival', 2, 'her word for Ysabel to the butchers\' captains']] },
      { label: 'Go to the Châtelet yourself', need: ['trait', 'bold', '>=', 2], why: 'Only a bold woman walks into the Châtelet in a rising (bold 2).', kind: 'chance', p: 0.6, win: [['flag', 'ysabelFreed', true], ['trust', 'friend', 30], ['rep', 4], ['owe', 'friend', 3, 'the Châtelet']], lose: [['health', -8], ['fav', 'bur', -8]], note: 'You will be seen. That is rather the point.' },
      { label: 'There is nothing to be done', note: 'There may not be.', ops: [['trust', 'friend', -20], ['flag', 'ysabelAbandoned', true]] },
    ],
  },
  {
    id: 'ysabel_flight', arc: 'ysabel', from: '1417a', until: '1417a', title: 'At your gate', if: [['alive', 'friend'], ['trust', 'friend', '>=', 30]],
    text: [
      { text: `The Count of Armagnac has broken up the queen's household and sent the queen to Tours under guard. Her people are being questioned; one of her gentlemen has already been drowned in the Seine in a sack. At dusk Ysabel is at your gate in a borrowed cloak with a single bag.` },
      { text: `"Hide me. A month. Two. Until they forget my name."` },
      { if: ['flag', 'ysabelFreed'], text: `It is the second time you would be saving her life. She knows it, and hates asking.` },
      { if: ['flag', 'ysabelAbandoned'], text: `The last time she needed you, in the Châtelet, you did nothing. She has come anyway. There is nobody else.` },
      { if: ['place', 'court'], text: `You are in Paris, in a house the Armagnacs could search tonight.` },
    ],
    choices: [
      { label: 'Hide her', kind: 'chance', p: { base: 0.45, estates: 0.35, fav: 'arm' }, win: [['flag', 'ysabelSheltered', true], ['trust', 'friend', 25], ['owe', 'friend', 3, 'hiding her from the Armagnacs']], lose: [['flag', 'ysabelSheltered', true], ['trust', 'friend', 25], ['owe', 'friend', 3, 'hiding her from the Armagnacs'], ['purse', -400, 'a fine for hiding the queen\'s woman'], ['fav', 'arm', -15]], ops: [['trait', 'warm', 1], ['trait', 'bold', 1]], note: 'Safer on the estates than in Paris. Safer still if the Armagnacs like you.' },
      { label: 'Give her money and a horse for Burgundy', note: 'The road to Troyes, where the Burgundians are gathering. She will not forget who paid for it.', ops: [['purse', -150, 'a horse for Ysabel'], ['trust', 'friend', 12], ['flag', 'ysabelToBurgundy', true], ['owe', 'friend', 1, 'the horse to Troyes']] },
      { label: 'Send her away', note: 'You have children.', ops: [['trust', 'friend', -30], ['flag', 'ysabelTurnedAway', true], ['trait', 'warm', -1]] },
    ],
  },
  {
    id: 'ysabel_warning', arc: 'ysabel', from: '1417b', until: '1417b', title: 'A letter from Troyes', if: [['alive', 'friend'], ['trust', 'friend', '>=', 50], ['not', ['flag', 'ysabelTurnedAway']]],
    text: [
      { text: `A letter from Ysabel, from Troyes, where the queen now keeps a court of her own beside the Duke of Burgundy. Three pages about hunting, a new gown and the dreadful food. Then the last line, smaller:` },
      { text: `"Do not be in Paris after Ascension. Burn this."` },
      { if: ['flag', 'ysabelSheltered'], text: `You hid her when it could have cost you everything. This is her paying it back.` },
      { if: ['flag', 'ysabelToBurgundy'], text: `You paid for the horse that took her there. This is the horse, paying you back.` },
    ],
    choices: [
      { label: 'Burn it, and remember it', note: 'She is telling you the Burgundians are coming back.', ops: [['warn', '1418a', 'friend'], ['trust', 'friend', 5]] },
    ],
  },

  // ---- JACQUELINE -----------------------------------------------------------
  {
    id: 'jacqueline_place', arc: 'jacqueline', from: '1406a', until: '1407b', title: 'A place in the queen\'s chamber', if: [['alive', 'rival']],
    text: [
      { text: `There is a place among the queen's ladies of the chamber: wages, lodging in the Hôtel Barbette, the queen's ear at night. Jacqueline d'Aubercourt, Dame de Brécourt now, is said to have it as good as settled.` },
      { if: ['flag', 'snubbedWedding'], text: `She has not forgotten that you refused her wedding. She makes sure you hear that she has the place, from three different people.` },
      { if: ['want', 'court'], text: `It is the place you want.` },
    ],
    choices: [
      { label: 'Press your own claim, through Ysabel', kind: 'chance', p: { base: 0.05, fav: 'queen', trust: 'friend' }, win: [['flag', 'queensLady', true], ['fav', 'queen', 8], ['trust', 'rival', -15]], lose: [['flag', 'jacquelinePlace', true], ['trust', 'rival', -8]], note: 'The queen\'s favour and your friend\'s word against a Burgundian marriage.' },
      { label: 'Let her have it', note: 'There will be other places. Jacqueline will be in the queen\'s ear.', ops: [['flag', 'jacquelinePlace', true], ['rep', 1]] },
      { label: 'Remind the queen\'s mistress whose man her husband is', need: ['trait', 'bold', '>=', 1], why: 'That takes some nerve (bold 1).', kind: 'chance', p: 0.55, win: [['trust', 'rival', -20], ['flag', 'placeBlocked', true]], lose: [['rep', -4], ['flag', 'jacquelinePlace', true], ['trust', 'rival', -20]], note: 'Neither of you gets it. She will know who.' },
    ],
  },
  {
    id: 'jacqueline_begs', arc: 'jacqueline', from: '1413b', until: '1414b', title: 'Jacqueline at your door', if: [['alive', 'rival'], ['beat', 'gerard_falls']],
    text: [
      { text: `Jacqueline d'Aubercourt comes to your door in a plain cloak with two children behind her and a third on her hip. Gérard is still in the Châtelet. The Armagnacs have put a captain into Brécourt and her out of it.` },
      { if: ['flag', 'owesJacqueline'], text: `In May she spoke for Ysabel to the butchers' captains because you asked. She has not mentioned it. She does not need to.` },
      { if: ['flag', 'denouncedGerard'], text: `"You put him there," she says. "I know. I would have done the same. I have nobody else to ask, and that should please you."` },
      { if: ['not', ['flag', 'denouncedGerard']], text: `"I have nobody else to ask," she says. "That should please you."` },
    ],
    choices: [
      { label: 'Take them in', note: 'Three children and a woman who has hated you for thirteen years, under your roof.', ops: [['purse', -150, 'Jacqueline and her children'], ['trust', 'rival', 35], ['flag', 'mercyJacqueline', true], ['owe', 'rival', 3, 'taking her children in'], ['trait', 'warm', 2], ['swingMod', '1418a', 0.35, 'Jacqueline d\'Aubercourt had your name struck from the Burgundian lists.']] },
      { label: 'Give her money for the road to Burgundy', note: 'Decent, and at a distance.', ops: [['purse', -150, 'money for Jacqueline'], ['trust', 'rival', 15], ['flag', 'mercyJacqueline', true], ['owe', 'rival', 1, 'money for the road to Burgundy'], ['swingMod', '1418a', 0.6, 'Jacqueline d\'Aubercourt spoke for you to the Burgundian council.']] },
      { label: 'Close the door', note: 'She would have.', ops: [['trust', 'rival', -35], ['flag', 'revengeJacqueline', true], ['trait', 'warm', -2], ['swingMod', '1418a', 1.5, 'Jacqueline d\'Aubercourt gave the Burgundian council your name.']] },
    ],
  },

  // ---- HER OWN LIFE ---------------------------------------------------------
  {
    id: 'queens_lady', arc: 'her', from: '1409a', until: '1416b', title: 'The queen\'s offer', if: [['not', ['flag', 'queensLady']], ['fav', 'queen', '>=', 60], ['rep', '>=', 50]],
    text: `The queen's mistress of the household asks to see you after vespers, in a window bay where nobody can stand close enough to hear. Would you accept a place among the queen's ladies? Wages of three hundred livres a year, a room in the Hôtel Barbette, and the queen's company whenever the queen wants it, which is often, and at night, when she cannot sleep.`,
    choices: [
      { label: 'Accept', note: 'The heart of the court. When the queen falls, her ladies fall with her.', ops: [['flag', 'queensLady', true], ['fav', 'queen', 10], ['purse', 150, 'the queen\'s wages'], ['regard', -2]] },
      { label: 'Decline, gracefully', note: 'Your household needs you more than the queen does.', ops: [['fav', 'queen', -4], ['rep', 1], ['regard', 3]] },
    ],
  },
];

/** What she can want, chosen at the wedding. */
export const WANTS = {
  brecourt: { label: 'Brécourt', goal: 'Your father\'s house back in your blood.', chronicle: 'her father\'s house back in her own blood', note: 'Your cousin will take it. Win it back at law, by favour, or through your children.' },
  court: { label: 'The queen\'s household', goal: 'A place among the queen\'s own ladies.', chronicle: 'a place among the queen\'s own ladies', note: 'The queen\'s favour, a good name, and a rival for the same place.' },
  children: { label: 'Your children', goal: 'Two children placed in good houses.', chronicle: 'to see two of her children placed in good houses', note: 'Children who live, raised well, and matched with houses that matter.' },
  soul: { label: 'Your soul', goal: 'Two chapels endowed in your name, and a good name at the end.', chronicle: 'to endow two chapels and die with a good name', note: 'Piety is the one reputation nobody can take from a woman.' },
};
