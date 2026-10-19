import { test, expect } from '@playwright/test';

const POST = '/post/the-missing-test-suite';

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
    expect(urls).toContain('https://danielfridljand.de/images/blog/the-missing-test-suite/shadow-timeline.png');
    expect(urls).toContain('https://danielfridljand.de/images/blog/the-missing-test-suite/map-grade.png');
    // Themed figures paste their light version only.
    expect(urls).toContain('https://danielfridljand.de/images/blog/the-missing-test-suite/review-screen-graded.png');
    expect(urls).not.toContain('https://danielfridljand.de/images/blog/the-missing-test-suite/review-screen-graded-dark.png');
  });

  test('a post without the confluence flag has no copy page', async ({ page }) => {
    const response = await page.goto('/post/kernel-to-attention/confluence');
    expect(response?.status()).toBe(404);
  });

  test('the post itself keeps its drawn figures', async ({ page }) => {
    await page.goto(POST);
    await expect(page.locator('.shadow-timeline svg')).toHaveCount(1);
    await expect(page.locator('figure.system-map svg.map-wide')).toHaveCount(16);
  });
});
