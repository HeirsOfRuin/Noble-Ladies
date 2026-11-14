// tools/press.config.mjs: what tools/press.mjs photographs. Each shot drives the
// REAL build to a moment worth showing, through the UI a player uses. First-visit
// hints are hidden so the shot is the game, not a tooltip.

/** Tap through the game: choices, the plan (ended as it stands), the report. Stops when `until` says so. */
async function play(page, steps, until = async () => false) {
  for (let i = 0; i < steps; i++) {
    if (await until()) return;
    if (await page.locator('.sheet [data-act="close"]').count()) { await page.locator('.sheet [data-act="close"]').first().click(); continue; }
    const choice = page.locator('[data-choice]:not([disabled])');
    if (await choice.count()) { await choice.first().click(); continue; }
    const pick = page.locator('[data-pick]:not([disabled])');
    if (await pick.count() && !(await page.locator('.chosen li').count())) {
      await pick.first().click();
      const t = page.locator('[data-target]:not([disabled])');
      if (await t.count()) await t.first().click();
      continue;
    }
    const commit = page.locator('[data-action="commit"]:not([disabled])');
    if (await commit.count()) { await commit.click(); continue; }
  }
}

const noSheet = async (page) => (await page.locator('.scrim').count()) === 0;
const storyCard = (page) => async () => (await noSheet(page)) && (await page.locator('.recall').count()) > 0 && (await page.locator('[data-choice]:not([disabled])').count()) >= 2;

export default {
  site: 'dist/site',
  size: [480, 820],              // the measured embed size (tools/embed-measure.mjs)
  cover: 'docs/itch/cover.html',
  hide: ['.hintbox', '.toast'],  // first-visit hints would cover a shot
  shots: [
    { name: 'title', async drive() {} },
    {
      name: 'a-choice',
      async drive({ page }) {
        await page.click('[data-act="new"]');
        await play(page, 160, storyCard(page));
      },
    },
    {
      name: 'the-plan',
      async drive({ page }) {
        await page.click('[data-act="new"]');
        await play(page, 40, async () => (await noSheet(page)) && (await page.locator('[data-action="commit"]').count()) > 0 && (await page.locator('.box.warnbox').count()) > 0);
      },
    },
    {
      name: 'the-house',
      async drive({ page }) {
        await page.click('[data-act="new"]');
        await play(page, 90);
        await page.click('[data-tab="house"]');
      },
    },
    {
      name: 'the-years',
      async drive({ page }) {
        await page.click('[data-act="new"]');
        await play(page, 120);
        await page.click('[data-tab="years"]');
      },
    },
  ],
};
