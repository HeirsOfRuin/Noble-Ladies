# The Lady of Saint-Pol

A noblewoman at the court of the mad King Charles VI, 1400 to 1422.

Status: scaffolded 2026-10-28 (game-scaffold, shape B). Placeholder game
in place; next: `docs/SPEC.md`.

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
| `npm run sim -- --runs=200 --by=difficulty` | Is it balanced? Batch runs by cell, ±1 SE (game-measure) |
| `npm run sim -- --trace --seed=3` | One game, turn by turn |
| `npm run smoke` | Does the real page work at 390px? |

## Layout

```
src/data/     logic-free tables
src/engine/   pure: rng, state (save contract), turn, derive, ledger
src/ui/       screens; read the engine, compute nothing
sim/          bot, adapter, game-measure kit
test/         invariants, save contract, fixtures
tools/        bundle, check-bundle, smoke, icons, stamp, browser
```

## Sources
<!-- Real figures and their sources; "rounded for a game, do not cite". -->
