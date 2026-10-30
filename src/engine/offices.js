// Offices (FRAME-ROUND3, the K2 fix). A place in the queen's household or the
// king's is paid only in the half-years she spends at court to collect it;
// after CONFIG.officeAbsenceLimit half-years away it goes to someone who was
// there. An office belongs to the party that granted it: when that party falls
// it is taken back, and holding it counts toward her tie to them. This is what
// makes a warning worth reading: leave Paris on a false rumour and the wages and
// perhaps the place are lost; stay through a true one and the fall hits her
// at full strength.

import { CONFIG } from '../data/config.data.js';
import { ACTIONS } from '../data/actions.data.js';
import { controlAt, factionLabel } from './clock.js';

export const OFFICE_TABLE = {
  queen: () => ({ id: 'queen', label: 'a place among the queen\'s ladies', faction: 'queen', income: 150 }),
  husband: (s) => {
    const c = controlAt(s.turn);
    const f = c === 'contested' ? (s.fav.arm >= s.fav.bur ? 'arm' : 'bur') : c;
    return { id: 'husband', label: `your husband's place in the king's household`, from: factionLabel(f, s.turn), faction: f, income: ACTIONS.office.income };
  },
};

export function grantOffice(s, id) {
  if (s.offices.some((o) => o.id === id)) return;
  s.offices.push({ ...OFFICE_TABLE[id](s), absent: 0 });
}

/** Pay or lose each office for the half-year. Returns report lines. */
export function officesTurn(s, place, coin) {
  const lines = [];
  for (const o of [...s.offices]) {
    if (o.id === 'husband' && (!s.husband || s.husband.status !== 'present')) {
      s.offices = s.offices.filter((x) => x !== o);
      lines.push(`${o.label[0].toUpperCase()}${o.label.slice(1)} has gone to another man: yours is not there to hold it.`);
      continue;
    }
    if (place === 'court') { o.absent = 0; coin(s, o.income, `wages: ${o.label}`); }
    else {
      o.absent += 1;
      if (o.absent >= CONFIG.officeAbsenceLimit) {
        s.offices = s.offices.filter((x) => x !== o);
        lines.push(`${o.label[0].toUpperCase()}${o.label.slice(1)} has been given to someone who was there.`);
      } else lines.push(`${o.label[0].toUpperCase()}${o.label.slice(1)}: unpaid this half-year, because you were away. Another half-year away and it will go to someone else.`);
    }
  }
  return lines;
}

export const officeTie = (s, f) => (s.offices.some((o) => o.faction === f) ? CONFIG.officeTie : 0);
