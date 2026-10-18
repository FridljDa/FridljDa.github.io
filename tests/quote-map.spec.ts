import { test, expect } from '@playwright/test';

const POST = '/post/from-drawing-to-quote';

test.describe('Figures in From Drawing to Quote', () => {
  test('the map opens the design sections, its part highlighted', async ({ page }) => {
    await page.goto(POST);
    const maps = page.locator('figure.quote-map');
    await expect(maps).toHaveCount(12);

    const map = (preset: string) => page.locator(`figure.quote-map[data-confluence-png$="/map-${preset}.png"] svg`);

    // Before any design there is only a request, an unknown box and an offer.
    await expect(map('clarify').getByText('?', { exact: true })).toBeVisible();
    await expect(map('clarify').getByText('Assessment')).toHaveCount(0);

    // The overview greys nothing out; a section's map greys out the rest.
    expect(await map('end-to-end').locator('g[opacity="0.3"]').count()).toBe(0);
    expect(await map('assess').locator('g[opacity="0.3"]').count()).toBeGreaterThan(0);

    // Rules set the limits; the checklist runs after extraction, not at intake.
    await expect(map('assess').getByText('Rules constrain')).toBeVisible();
    await expect(map('extract').getByText('Checklist, question')).toBeVisible();
    await expect(map('intake').getByText('Checklist, question')).toHaveCount(0);
  });

  test('the running example and its figures', async ({ page }) => {
    await page.goto(POST);
    const figures = page.locator('figure.quote-figure');
    await expect(figures).toHaveCount(6);

    const figure = (name: string) => page.locator(`figure.quote-figure[data-confluence-png$="/${name}.png"] svg`);
    await expect(figure('request').getByText('Missing')).toBeVisible();
    await expect(figure('review').getByText('Differs from similar parts')).toBeVisible();
    await expect(figure('break-even').getByText('same price')).toBeVisible();
  });
});
