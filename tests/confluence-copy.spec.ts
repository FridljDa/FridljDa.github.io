import { test, expect } from '@playwright/test';

const POST = '/post/the-missing-compiler';

test.describe('Confluence copy of a post', () => {
  test('body survives a paste: absolute URLs, no heading anchors, no SVG', async ({ page }) => {
    await page.goto(`${POST}/confluence`);
    const body = page.locator('#body');
    await expect(body.locator('h2').first()).toBeVisible();

    await expect(body.locator('a.heading-link')).toHaveCount(0);
    await expect(body.locator('svg, figure')).toHaveCount(0);

    const urls = await body.evaluate((el) => [
      ...[...el.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')!),
      ...[...el.querySelectorAll('img[src]')].map((img) => img.getAttribute('src')!),
    ]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\//);
    }
    expect(urls).toContain('https://danielfridljand.de/images/blog/the-missing-compiler/shadow-timeline.png');
    expect(urls).toContain('https://danielfridljand.de/images/blog/the-missing-compiler/map-loop.png');
    // Themed figures paste their light version only.
    expect(urls).toContain('https://danielfridljand.de/images/blog/the-missing-compiler/sme-review-screen.png');
    expect(urls).not.toContain('https://danielfridljand.de/images/blog/the-missing-compiler/sme-review-screen-dark.png');
  });

  test('the post itself keeps its drawn figures', async ({ page }) => {
    await page.goto(POST);
    await expect(page.locator('.shadow-timeline svg')).toHaveCount(1);
    await expect(page.locator('figure.system-map svg.map-wide')).toHaveCount(11);
  });
});
