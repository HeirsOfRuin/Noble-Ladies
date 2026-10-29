# The Lady of Saint-Pol

A noblewoman at the court of the mad King Charles VI, 1400 to 1422.

You play a young noblewoman of a middling house at the court of the mad King
Charles VI. She cannot command armies or hold office; her power runs through
other people. Over four acts she negotiates her own marriage (at eighteen),
builds a place at court, survives the war between Armagnacs and Burgundians,
and comes through Agincourt and its aftermath. The aim is that her house is
still standing in 1422, and that she is too.

Status (2026-10-29): **first playable, with her own story**. All four acts,
kill gate run, phone UI; 25 story beats (the Brécourt inheritance, her husband,
Ysabel, Jacqueline), her character, her want and her own words
(`docs/FRAME-DEPTH.md`). Next: the author's verdict on this round's voice.
Read `docs/SPEC.md` (one page), `docs/KILLGATE.md` (what the measurements say),
`docs/DESIGN.md` (how it is built), `docs/BRIEF.md` (the original brief).

## Play as an app

Once the Pages workflow has run on the default branch: open
https://heirsofruin.github.io/Noble-Ladies/ on a phone and choose Install (Chrome)
or Share → Add to Home Screen (Safari). It plays with the network off. Saves
live in that browser; Menu → Copy a save code moves a game anywhere.

## Run

```
npm run serve        # then open http://localhost:8000
npm run build        # dist/<slug>.html (one file), dist/site/ (installable)
```

## Check

```
npm run check     # tests, a 50-game bot batch, the bundle, the bundle check, the phone smoke test
```

Must pass before every commit.

## Instruments

| Command | Question |
|---|---|
| `npm test` | Is it true? Invariants and the save contract |
| `npm run sim -- --runs=400 --by=policy` | Is it balanced? Every strategy, ±1 SE (game-measure) |
| `npm run sim -- --runs=400 --policy=loyal_bur+deaf` | What is news worth to a player? (compare without `+deaf`) |
| `npm run sim -- --trace --seed=3 --policy=christine` | One game, half-year by half-year, with the epitaph |
| `npm run smoke` | Does the real page work at 390px? |

## Layout

```
src/data/     logic-free tables
src/engine/   pure: clock, state (save contract), turn, derive, ledger, effects,
              act1, actions, news, family, history, events, ending
src/ui/       screens; read the engine, compute nothing
sim/          bot, adapter, game-measure kit
test/         invariants, save contract, fixtures
tools/        bundle, check-bundle, smoke, icons, stamp, browser
```

## Sources

Dates of the turning points follow the standard narrative accounts:
- R. C. Famiglietti, *Royal Intrigue: Crisis at the Court of Charles VI, 1392-1420* (1986).
- B. Guenée, *Un meurtre, une société: l'assassinat du duc d'Orléans, 23 novembre 1407* (1992).
- J. Sumption, *The Hundred Years War IV: Cursed Kings* (2015).
- Christine de Pizan, *The Treasure of the City of Ladies* (1405), trans. S. Lawson
  (Penguin, 1985). The governess's lines paraphrase its advice.

Dower: a widow's life use of half the lands her husband held at the marriage.
Philippe de Beaumanoir, *Coutumes de Beauvaisis* (c. 1283) states the general
custom; the later written custom of Paris says the same. The game applies it to
1400 Paris by inference. (Background: Castelli in *Les Cahiers de droit* 20 (1979), doi:10.7202/042319ar;
the IHD/CNRS chapter on dower in Beaumanoir.)

Invented: Marguerite de Brécourt and her house; her governess, parents, steward,
chamberwoman, confessor, procureur; Ysabel de Fontenoy; Jacqueline d'Aubercourt;
the four suitors; the houses that offer for her children. Money is game-scaled
against the income of a middling house, not a price series: rounded for a game,
do not cite.
