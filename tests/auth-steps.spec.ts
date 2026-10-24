import { test, expect } from '@playwright/test';

const POST = '/post/api-keys-oauth-jwt';

test.describe('Pinned figures in API Keys, OAuth and JWT', () => {
  test('the figure highlights the step being read, on wide screens only', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(POST);
    // The authorization code block: the one with the code exchange.
    const block = page.locator('.auth-steps').filter({ hasText: 'trades it (7)' });
    const lit = () => block.locator('.pinned [data-step]:not(.off)').evaluateAll((els) => [...new Set(els.map((e) => (e as HTMLElement).dataset.step))]);

    // Bring the paragraph about the code exchange to the reading line.
    const exchange = block.locator('.steps > p', { hasText: 'trades it (7)' });
    const top = await exchange.evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y - window.innerHeight * 0.4 + 10), top);
    await expect.poll(lit).toEqual(['7']);

    // Above the block, nothing is greyed out.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(block.locator('.pinned .off')).toHaveCount(0);
  });

  test('on a phone the figure sits above the text and is never greyed out', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(POST);
    // The authorization code block: the one with the code exchange.
    const block = page.locator('.auth-steps').filter({ hasText: 'trades it (7)' });
    await block.locator('.steps > p', { hasText: 'trades it (7)' }).scrollIntoViewIfNeeded();
    await expect(block.locator('.pinned .off')).toHaveCount(0);
  });
});
