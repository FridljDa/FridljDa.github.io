import { test, expect } from '@playwright/test';

const POST = '/post/the-missing-compiler';

test.describe('System map in The Missing Compiler', () => {
  test('every section opens with the map, its part highlighted', async ({ page }) => {
    await page.goto(POST);
    const headings = page.locator('.prose h2, .prose h3');
    const maps = page.locator('figure.system-map');
    await expect(maps).toHaveCount(16);
    // One under every section and step heading, plus the second one in "The bottleneck moves"
    // (today, after before) and in "The next bottleneck" (what it could be).
    expect(await maps.count()).toBe((await headings.count()) + 2);

    // The overview greys nothing out; a section's map greys out the rest.
    const greyed = (i: number) => maps.nth(i).locator('g[opacity="0.22"]').count();
    expect(await greyed(0)).toBe(0);
    expect(await greyed(1)).toBeGreaterThan(0);
    // Both layouts carry the tag; only the one that fits the width is shown.
    const before = page.locator('figure.system-map[data-confluence-png$="/map-before.png"]');
    await expect(before.locator('svg:visible').getByText('Bottleneck')).toBeVisible();
  });

  test('the mockups follow the site theme', async ({ page }) => {
    await page.goto(POST);
    const screen = page.locator('.themed-image').nth(1);
    // The images are lazy, so they only load, and get a size, in view.
    await screen.scrollIntoViewIfNeeded();
    await expect(screen.locator('img.light')).toBeVisible();
    await expect(screen.locator('img.dark')).toBeHidden();

    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await expect(screen.locator('img.dark')).toBeVisible();
    await expect(screen.locator('img.light')).toBeHidden();
  });

  test('wide screens get the four-column map, phones the two-column one', async ({ page }) => {
    const map = page.locator('figure.system-map').first();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(POST);
    await expect(map.locator('svg.map-wide')).toBeVisible();
    await expect(map.locator('svg.map-tall')).toBeHidden();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(map.locator('svg.map-tall')).toBeVisible();
    await expect(map.locator('svg.map-wide')).toBeHidden();
  });

  test('the post does not widen the page on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(POST);
    // Polled: until the post's figures settle, the page can be briefly wider.
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
