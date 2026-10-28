// Logic-free tables. Every number a designer might tune lives in src/data/, and
// nothing in src/data/ computes anything.
//
// Money is in livres tournois (l.t.). Scale: a middling noble house of the
// Île-de-France or Picardy drew a few hundred to a couple of thousand livres a
// year from rents; a knight's ransom ran to thousands. The numbers are
// game-scaled against that, not a price series. See docs/DESIGN.md "Economy".

export const CONFIG = {
  // The calendar. Act 1 is six scenes in 1400; then one turn per half-year
  // from spring 1401 to autumn 1422 (44 turns).
  birthYear: 1383,             // she is 17 through Act 1 (1400) and 18 at the wedding (spring 1401)
  act1Year: 1400,
  act1Scenes: 6,
  firstYear: 1401,
  lastYear: 1422,

  // Starting position (before Act 1 adjusts it)
  startRep: 45,
  startInfo: 20,
  startHousehold: 55,
  startHealth: 80,
  startPurse: 300,             // her household's own cash once married, before the dowry is counted

  // Income and costs per half-year
  rentPerHolding: 42,
  presenceRent: { estates: 1.0, court: 0.85 },  // absent, the steward collects less (and his honesty matters more)
  courtCost: 300,              // lodging, clothes, gifts that are not gifts, servants in livery
  estatesCost: 230,
  husbandSpendPer: 35,         // x his spending trait (1-5)
  debtInterest: 0.05,          // per half-year on a negative purse
  ruinDebt: -4500,             // creditors take the house

  // Actions per half-year
  slots: { court: 3, estates: 2 },
  smallHouseholdBelow: 30,     // a run-down household loses one action

  // Drift per half-year
  favourDecay: { court: 2, estates: 5 },
  infoDrift: { court: 8, estates: -10 },
  infoCap: { court: 70, estates: 40 },
  householdDrift: { court: -4, estates: 3 },
  countryRep: 45,              // on the estates a name above this fades by one a half-year: out of sight at court
  // Health drifts toward a level set by where she lives: court life holds her at
  // a middling 45, the estates restore her toward 90. Drift never kills; only
  // fever, childbed and violence can, and low health makes them likelier.
  healthTarget: { court: 45, estates: 90 },
  healthStep: { court: 3, estates: 6 },

  // Family
  pregnancyChance: 0.3,
  maxBirths: 4,
  birthRiskBase: 0.025,        // her risk of dying in childbed at health 60; higher when her health is low
  infantDeathPerTurn: 0.035,   // per child under 5, before household care
  childOfAge: 14,              // a betrothal contract can be negotiated from this age; the wedding waits

  // Faction swings
  hedgeAt: 45,                 // favour with both sides at or above this: the hedge can be exposed
  warningLead: 2,              // turns before a swing that true warnings can arrive
  swingSeverity: 1.6,          // scales every swing's severity (history.data.js); the kill gate's lever for what news is worth
  awayFromSwing: 0.55,         // on the estates when Paris changes hands, fines and confiscations shrink to this
};

export const DIFFICULTY = {
  easy: { label: 'Gentle', costMult: 0.85, dangerMult: 0.7 },
  normal: { label: 'As it was', costMult: 1, dangerMult: 1 },
  hard: { label: 'Hard years', costMult: 1.15, dangerMult: 1.3 },
};

export const FACTIONS = {
  queen: { label: "the queen's household", short: 'Queen' },
  arm: { label: 'the Orléans party', labelLate: 'the Armagnacs', short: 'Orléans', shortLate: 'Armagnac', renameYear: 1410 },
  bur: { label: 'the Burgundians', short: 'Burgundy' },
};
