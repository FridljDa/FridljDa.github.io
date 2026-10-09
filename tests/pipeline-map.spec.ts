import { test, expect } from '@playwright/test';

const POST = '/post/first-level-support-automation';

test.describe('Figures in Architecture of a First-Level Support Automation', () => {
  test('every section opens with the pipeline map, its step highlighted', async ({ page }) => {
    await page.goto(POST);
    const headings = page.locator('.prose h2');
    const maps = page.locator('figure.pipeline-map');
    await expect(maps).toHaveCount(7);
    // One under every section heading, plus the overview before the first.
    expect(await maps.count()).toBe((await headings.count()) + 1);

    // The overview greys nothing out; a section's map greys out the rest.
    const greyed = (i: number) => maps.nth(i).locator('g[opacity="0.22"]').count();
    expect(await greyed(0)).toBe(0);
    expect(await greyed(1)).toBeGreaterThan(0);
    // Both layouts carry the tag; only the one that fits the width is shown.
    const fallback = page.locator('figure.pipeline-map[data-confluence-png$="/map-default.png"]');
    await expect(fallback.locator('svg:visible').getByText('Default')).toBeVisible();
  });

  test('the running example has a figure for each step, and no Mermaid', async ({ page }) => {
    await page.goto(POST);
    const figures = page.locator('figure.pipeline-figure');
    await expect(figures).toHaveCount(3);
    await expect(figures.nth(0).getByText('Account locked')).toBeVisible();
    await expect(figures.nth(1).getByText('Threshold')).toBeVisible();
    await expect(figures.nth(2).getByText('Unlock steps')).toBeVisible();
    await expect(page.locator('.prose .mermaid, .prose pre.mermaid')).toHaveCount(0);

    // The customer message and the extraction figure follow the site theme.
    const extraction = page.locator('.themed-image').nth(1);
    await extraction.scrollIntoViewIfNeeded();
    await expect(extraction.locator('img.light')).toBeVisible();
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await expect(extraction.locator('img.dark')).toBeVisible();
    await expect(extraction.locator('img.light')).toBeHidden();
  });

  test('wide screens get the left-to-right map, phones the two-column one', async ({ page }) => {
    const map = page.locator('figure.pipeline-map').first();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(POST);
    await expect(map.locator('svg.map-wide')).toBeVisible();
    await expect(map.locator('svg.map-tall')).toBeHidden();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(map.locator('svg.map-tall')).toBeVisible();
    await expect(map.locator('svg.map-wide')).toBeHidden();
  });

  test('the Confluence copy shows the PNGs instead', async ({ page }) => {
    await page.goto(`${POST}/confluence`);
    const body = page.locator('#body');
    await expect(body.locator('svg, figure')).toHaveCount(0);
    const srcs = await body.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
    const base = 'https://danielfridljand.de/images/blog/first-level-support-automation';
    for (const png of ['map-overview', 'map-plan', 'intent-dag', 'fetch-scores', 'plan-tree', 'extraction']) {
      expect(srcs).toContain(`${base}/${png}.png`);
    }
    expect(srcs).not.toContain(`${base}/extraction-dark.png`);
  });
});
