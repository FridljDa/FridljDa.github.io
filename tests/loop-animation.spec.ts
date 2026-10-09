import { test, expect } from '@playwright/test';

const SUPPORT = '/post/first-level-support-automation';
const COMPILER = '/post/the-missing-compiler';

test.describe('Loop animations', () => {
  test('the shadow loop plays once in view and grows the DAG', async ({ page }) => {
    await page.goto(SUPPORT);
    const figure = page.locator('figure.loop-animation');
    await expect(figure.locator('[data-ready]')).toBeAttached();

    // Rewound before the reader reaches it: the small DAG, without grown leaves.
    await expect(figure.getByText('Login problem')).toBeAttached();
    await expect(figure.getByText('Password reset')).toHaveCount(0);

    // Plays in real time; the first cross grows its leaf about ten seconds in.
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.getByText('Password reset')).toBeVisible({ timeout: 20_000 });
  });

  test('reduced motion shows the last frame without a player', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(COMPILER);
    const figures = page.locator('figure.loop-animation');
    await expect(figures).toHaveCount(1);

    const loop = figures.nth(0);
    await expect(loop.getByText('Password reset')).toBeVisible();
    await expect(loop.getByText('Account locked')).toBeVisible();
    await expect(loop.getByRole('button', { name: /play/i })).toHaveCount(0);
  });

  test('the animations do not widen the page on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(SUPPORT);
    await expect(page.locator('figure.loop-animation [data-ready]')).toBeAttached();
    // Polled: until the post's Mermaid diagrams render, their source widens the page on its own.
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('the Confluence copies show the PNGs instead', async ({ page }) => {
    for (const [post, pngs] of [
      [SUPPORT, ['shadow-loop']],
      [COMPILER, ['shadow-loop']],
    ] as const) {
      await page.goto(`${post}/confluence`);
      const srcs = await page.locator('#body img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
      for (const png of pngs) {
        expect(srcs, post).toContain(`https://danielfridljand.de/images/blog/animations/${png}.png`);
      }
      await expect(page.locator('#body astro-island')).toHaveCount(0);
    }
  });
});
