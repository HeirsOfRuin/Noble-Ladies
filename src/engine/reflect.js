// Her own words: a page "from the margins of her book of hours" at the end of
// Acts 2 and 3, and a last line at the end. First person, built only from what
// happened in this game (rule 8: words derive from state). Each line reads a
// fact; nothing is said that did not happen.

import { tokens } from './arcs.js';
import { wantStatus, traitWords } from './derive.js';

const fill = (s, t) => { const k = tokens(s); return t.replace(/\{(\w+)\}/g, (m, x) => (x in k ? k[x] : m)); };
const tr = (s, a) => s.traits?.[a] ?? 0;

function opening(s) {
  if (tr(s, 'devout') >= 2) return 'I have said my hours every day, and some days they were the only quiet I had.';
  if (tr(s, 'devout') <= -2) return 'Brother Robert says I have not confessed since Candlemas. Brother Robert says a great many things.';
  if (tr(s, 'bold') >= 2) return 'I have said what I thought in great men\'s halls, and nobody has struck me dead yet.';
  if (tr(s, 'bold') <= -2) return 'I have learned to count to ten before I speak, and some days to a hundred.';
  if (tr(s, 'warm') >= 2) return 'I write this with the children asleep in the next room, which is the only reason it is quiet.';
  if (tr(s, 'warm') <= -2) return 'I keep my own counsel. It is the only counsel at court nobody can sell.';
  return 'I write this at night, when nobody wants anything of me.';
}

function husbandLine(s) {
  const h = s.husband;
  if (!h) return null;
  const r = h.regard ?? 40;
  if (h.status === 'captured') return '{husband} writes from England every season. His hand is getting worse; his jokes are not.';
  if (r >= 65) return '{husband} asks my opinion now, and sometimes takes it. I did not expect that, and I do not think he did.';
  if (r <= 30) return '{husband} and I are courteous to each other, like two lords whose lands march together.';
  return '{husband} is what I was told he would be: no better, no worse, and away a good deal.';
}

function childrenLine(s) {
  const living = s.children.filter((c) => c.alive), dead = s.children.length - living.length;
  if (!s.children.length) return 'No children yet. My mother-in-law has a saint for that, and a great deal to say.';
  const names = living.map((c) => c.name);
  const who = names.length ? `${names.slice(0, -1).join(', ')}${names.length > 1 ? ' and ' : ''}${names.at(-1)}` : '';
  return `${living.length ? `${who} ${living.length > 1 ? 'are' : 'is'} living` : 'None of them lived'}${dead ? `, and ${dead === 1 ? 'one is' : `${dead} are`} in the churchyard` : ''}.`;
}

function brecourtLine(s) {
  const b = s.flags.brecourt;
  if (b === 'judged') return 'Brécourt is mine by judgment of the Parlement. I went and stood in the chapel where my father lies and did not know what to say to him.';
  if (b === 'seized') return 'Brécourt is mine because the Armagnacs gave it to me. Things the Armagnacs give do not last.';
  if (b === 'lost') return 'Brécourt is Gérard\'s again. I had it for five years.';
  if (b === 'refused') return 'The Parlement found for Gérard. Master Lorfèvre sent his account the same week.';
  if (s.flags.caseBrecourt) { const n = s.flags.brecourtHearings || 0; return `Master Lorfèvre says the Parlement is slow but not deaf. ${n ? `It has heard us ${['', 'once', 'twice', 'three times', 'four times', 'five times'][n] || `${n} times`}` : 'It has not heard us yet'}, and Gérard still sleeps in my father's bed.`; }
  if (s.flags.renounced) return 'I signed Brécourt away at seventeen without reading the clause. Gérard sleeps in my father\'s bed.';
  return 'I never signed Brécourt away. That is something. It is not Brécourt.';
}

function act2(s) {
  const out = [opening(s), husbandLine(s), childrenLine(s), brecourtLine(s)];
  out.push(s.fav.arm >= 40
    ? 'In November they killed the Duke of Orléans in the street. I saw him at the queen\'s house in October, laughing at something the queen said.'
    : 'In November they killed the Duke of Orléans in the street, and the whole city held its breath, and then let it out again.');
  if (s.flags.ysabelAlibi) out.push('I lied for Ysabel before the queen\'s women. God forgive me, I would do it again.');
  else if (s.flags.lieFound) out.push('I lied for Ysabel and was found out. She still curtseys to me. I am not sure I deserve it.');
  if (s.flags.jacquelinePlace) out.push('Jacqueline has the queen\'s ear at night. I can tell when she has used it.');
  if (s.flags.placeBlocked) out.push('Neither Jacqueline nor I sleep in the Hôtel Barbette. She knows why.');
  if (s.flags.husbandReformed) out.push('{husband} has not pledged anything of mine since the goldsmith\'s letter.');
  if (s.flags.saidMurder) out.push('I told {husband} that murder is murder, whatever Aristotle says. He repeated it at a Burgundian table. We are not asked there now.');
  if (s.flags.queensLady) out.push('I have a room in the Hôtel Barbette now, and the queen talks to me when she cannot sleep, which is most nights.');
  return out.filter(Boolean);
}

function act3(s) {
  const out = [];
  const a = s.flags.agincourt;
  if (a === 'killed') out.push(s.flags.blessing ? 'He went to Agincourt knowing I did not hold it against him. That is what I have.' : '{husband} is dead at Agincourt, with the Constable and three dukes and half the north. I keep reading the list as if his name might go away.');
  if (a === 'captured') out.push('{husband} is a prisoner in England. I count the ransom the way my mother counted her beads.');
  if (s.flags.ransomHelp) out.push('The Duke of Burgundy\'s people took a third off his price. They will want something for it one day.');
  if (a === 'survived') out.push('{husband} came back from Agincourt. Some nights I think part of him did not.');
  if (a === 'absent') out.push('{husband} did not go to Agincourt, and is alive, and is ashamed of it. I am not.');
  out.push(brecourtLine(s));
  if (s.flags.mercyJacqueline) out.push('I opened my door to Jacqueline and her children. I do not know yet whether that was charity or a very long investment.');
  if (s.flags.revengeJacqueline) out.push('I closed my door on Jacqueline. She will remember it when the wheel turns, and it always turns.');
  if (s.flags.ysabelFreed) out.push('I got Ysabel out of the Châtelet. She has not thanked me, which is how I know she means to.');
  if (s.flags.ysabelAbandoned) out.push('I did nothing for Ysabel when the butchers took her. They let her go in the end. She has not written since.');
  if (s.flags.gerardShamed) out.push('Gérard has not forgiven me the ring. Good.');
  if (s.flags.motherAtBrecourt) out.push('My mother lies beside my father at Brécourt, because Jacqueline asked it of Gérard. I did not expect to owe her that.');
  if (s.flags.gerardRefusedBurial) out.push('Gérard would not let my mother lie beside my father. I have added it to the account.');
  const w = wantStatus(s);
  if (w) out.push(w.achieved ? 'What I wanted, I have. Now I must keep it.' : `What I wanted, I do not have. ${w.progress}`);
  return out.filter(Boolean);
}

/** The margin page at the end of an act (2 or 3). */
export function marginCard(s, act) {
  const lines = (act === 2 ? act2(s) : act3(s)).map((t) => fill(s, t));
  const said = traitWords(s);
  return {
    id: `margin:${act}`, margin: true, title: 'In the margins of her book of hours', when: act === 2 ? 'Winter, 1407' : 'Winter, 1415',
    text: lines.join(' '),
    lines: said.length ? [`What is said of her: ${said.join(', ')}.`] : [],
    choices: [{ label: 'Turn the page', ops: [] }],
  };
}

/** Her last line, for the ending. */
export function lastWords(s) {
  const w = wantStatus(s);
  if (s.outcome === 'dead') return 'She left no last words that anyone wrote down.';
  if (!w) return '';
  const lines = {
    brecourt: w.achieved ? '"My grandchildren will be born at Brécourt. That will do."' : '"I wanted Brécourt. I shall have a grave there, if Gérard allows it."',
    court: w.achieved ? '"I sat with the queen through the worst nights of her life. Somebody had to."' : '"The queen never knew my name. That may have been a mercy."',
    children: w.achieved ? '"My children are placed. Whatever happens to France, they will eat."' : '"I could not place them as I wanted. I could keep them alive. Most years that was enough."',
    soul: w.achieved ? '"The masses are paid for. Let them sing."' : '"I meant to give more to God. The house kept asking first."',
  };
  return lines[w.id];
}
