# The Lady of Saint-Pol — itch.io page kit

Everything needed to put the game on itch.io, and the things that are a
decision rather than a task. Every count in the copy is read out of the build, not from memory.

## Files

| File | What it is | Built by |
|---|---|---|
| `release/the-lady-of-saint-pol-web.zip` | The game, played on the page (index.html at the zip root, no service worker) | `node tools/build-itch.mjs` |
| `release/the-lady-of-saint-pol.html` | The game as one file: a download that opens in any browser (not Safari) | the bundler, then `build-itch.mjs --single` |
| `release/the-lady-of-saint-pol.apk` | Android app (optional) | GitHub Actions, `android.yml` |
| `release/the-lady-of-saint-pol-itch-kit.zip` | All of the above, the page text and images, and START-HERE.txt | `node tools/make-itch-kit.mjs` |

## Upload settings

| Field | Value |
|---|---|
| Kind of project | HTML |
| Upload 1 (played on the page) | `the-lady-of-saint-pol-web.zip`, tick "This file will be played in the browser" |
| Upload 2 (download) | `the-lady-of-saint-pol.html`, Windows, macOS and Linux ticked |
| Embed | **480 x 820** (measured with `node tools/embed-measure.mjs`; table below) |
| Mobile friendly | On, orientation portrait |
| Fullscreen button | On |
| Automatically start on page load | Off (a title screen is the start) |
| Classification | Games |
| Release status | In development (until the author's timed playthrough) |
| Pricing | No payments |
| Genre | Strategy |
| Tags | medieval, historical, text-based, turn-based, strategy, singleplayer, female-protagonist, narrative, politics, management |
| Cover | `cover-630x500.png` (check `cover-preview-315x250.png`: that is how browse listings show it) |
| Screenshots | `shot1-title`, `shot2-a-choice`, `shot3-the-plan`, `shot4-the-house`, `shot5-the-years` (see `press-sheet.png`) |
| Links | The installable copy: https://heirsofruin.github.io/Noble-Ladies/ |
| Community | Comments on, so players can post save codes with bug reports |

Embed measurement (`node tools/embed-measure.mjs`):

```
embed      game width  chrome  content  overflow  wasted
360 x 640         360     109      531         0       0
390 x 844         390     109      735         0       0
480 x 820         480      84      736         0       0
600 x 800         600      84      716         0       0
800 x 820         620      84      736         0     180
960 x 760         620      84      676         0     340

Recommended: 480 x 820 (736px to read in, no overflow, 0px unused).
```

## AI disclosure

itch asks whether the project uses generative AI, and for which parts. Say
plainly what was generated and what was yours. Tick the boxes that apply (Text,
Graphics, Code, Sound). Suggested wording, to adjust to your own:

> Made with AI assistance. I designed the game, its systems and its world, and
> directed, edited and play-tested it; the code, the text and the drawn art were
> generated with an AI model to that design.

## Short description (the one-line field, under ~120 characters)

> A noblewoman at the mad king's court, 1400-1422: persuade, write, wait, and choose whom to trust.

## Known constraints (say them on the page)

- Saves live in this browser. If a browser blocks site data in embedded frames,
  open the game fullscreen or use the save code (Menu).
- Saves on itch and in the installed copy are separate; the save code moves a game.
- On "As it was" (the middle difficulty) about four careful players in five live to the end (christine bot, 300 runs: 81%). "Gentle" is 88%, "Hard years" 78%. Start on the middle one.
- Nothing is fetched: system fonts; art and sound are drawn in code.

## Before going public

- [ ] `npm run check` green on the commit being released
- [ ] `node tools/pre-public.mjs --zip=release/the-lady-of-saint-pol-web.zip` clean (the zip in an itch-style frame, storage blocked and allowed; copy checks)
- [ ] `node tools/update-check.mjs` clean (a new deploy reaches someone who already has the app)
- [ ] Every number in the description confirmed against the build (pre-public lists them)
- [ ] Tutorial and help re-read against the build
- [ ] Cover checked at 315 x 250; shots looked at on the press sheet
- [ ] Played the uploaded draft yourself, in a private window and on a phone: start, a few turns, copy a save code, reload, load it
- [ ] Then Public

## After publishing

Watch the comments the first week; ask for a save code with every bug report.
Each fix: rebuild, `build-itch.mjs`, upload over the old file (the page stays);
a devlog for anything players would notice (`devlog.md`).
