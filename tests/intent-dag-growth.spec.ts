import { test, expect } from '@playwright/test';

const POST = '/post/first-level-support-automation';

test.describe('Intent DAG growth figure', () => {
  test('plays once in view and rests on the full DAG', async ({ page }) => {
    await page.clock.install();
    await page.goto(POST);
    const figure = page.locator('figure.intent-dag-growth');

    // Rewound before the reader reaches it: only the launch intents are shown.
    await expect(figure.locator('.pending')).not.toHaveCount(0);

    await figure.scrollIntoViewIfNeeded();
    await page.clock.runFor(15_000);
    await expect(figure.locator('.pending')).toHaveCount(0);
    await expect(figure.locator('.current')).toHaveCount(0);

    await figure.getByRole('button', { name: 'Replay' }).click();
    await expect(figure.locator('.pending')).not.toHaveCount(0);
  });

  test('reduced motion shows the full DAG without a replay control', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(POST);
    const figure = page.locator('figure.intent-dag-growth');

    await expect(figure.getByRole('img', { name: /grew the intent DAG/ })).toBeVisible();
    await expect(figure.locator('.pending')).toHaveCount(0);
    await expect(figure.getByRole('button', { name: 'Replay' })).toBeHidden();
  });
});
