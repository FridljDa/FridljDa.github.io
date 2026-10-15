import { test, expect } from '@playwright/test';

const POST = '/post/workflow-vs-agent';

const PRESETS = ['overview', 'agent-first', 'workflow', 'tree', 'fallback', 'guards', 'next-time', 'start'];

test.describe('Figures in Workflow or Agent', () => {
  test('every section opens with the decision map, its part highlighted', async ({ page }) => {
    await page.goto(POST);
    const headings = page.locator('.prose h2');
    const maps = page.locator('figure.decision-map');
    await expect(maps).toHaveCount(8);
    // One under every section heading; the TL;DR's is the overview.
    expect(await maps.count()).toBe(await headings.count());

    // The overview greys nothing out; a section's map greys out the rest.
    const greyed = (i: number) => maps.nth(i).locator('g[opacity="0.22"]').count();
    expect(await greyed(0)).toBe(0);
    expect(await greyed(1)).toBeGreaterThan(0);

    // The first design has no intent step and no workflow at all.
    const first = page.locator('figure.decision-map[data-confluence-png$="/map-agent-first.png"] svg:visible');
    await expect(first.getByText('Any order')).toBeVisible();
    await expect(first.getByText('Workflow')).toHaveCount(0);

    // Before the fallback there is no default: the LLM's one job is reading the message.
    const workflow = page.locator('figure.decision-map[data-confluence-png$="/map-workflow.png"] svg:visible');
    await expect(workflow.getByText('One job')).toBeVisible();
    await expect(workflow.getByText('Default')).toHaveCount(0);

    // The close is about the experts, not the tools.
    const start = page.locator('figure.decision-map[data-confluence-png$="/map-start.png"] svg:visible');
    await expect(start.getByText('Fill the grid')).toBeVisible();

    // Next time mirrors the leftovers: the default moves to the agent and a request type graduates into code.
    const fallback = page.locator('figure.decision-map[data-confluence-png$="/map-fallback.png"] svg:visible');
    await expect(fallback.getByText('Leftovers')).toBeVisible();
    await expect(fallback.getByText('Other', { exact: true })).toBeVisible();
    // Both layouts carry the labels; only the one that fits the width is shown.
    const next = page.locator('figure.decision-map[data-confluence-png$="/map-next-time.png"] svg:visible');
    await expect(next.getByText('Default')).toBeVisible();
    await expect(next.getByText('Graduated', { exact: true })).toBeVisible();
    await expect(next.getByText('Graduate', { exact: true })).toBeVisible();
  });

  test('the running example has the grid, the coverage schematic and the unlock tool, and no Mermaid', async ({ page }) => {
    await page.goto(POST);
    const figures = page.locator('figure.decision-figure');
    await expect(figures).toHaveCount(3);
    const grid = figures.nth(0).locator('svg:visible');
    await expect(grid.getByText('Unlock steps')).toBeVisible();
    await expect(grid.getByText('?', { exact: true })).toHaveCount(7);
    const coverage = figures.nth(1).locator('svg:visible');
    await expect(coverage.getByText('Branches written →')).toBeVisible();
    await expect(coverage.getByText('Account locked')).toBeVisible();
    const tool = figures.nth(2).locator('svg:visible');
    await expect(tool.getByText('Flagged?')).toBeVisible();
    await expect(tool.getByText('Refuse')).toBeVisible();
    await expect(page.locator('.prose .mermaid, .prose pre.mermaid')).toHaveCount(0);
  });

  test('the figures follow the site theme', async ({ page }) => {
    await page.goto(POST);
    const text = () => page.locator('figure.decision-map').first().evaluate((el) => getComputedStyle(el).getPropertyValue('--lv-text').trim());
    expect(await text()).toBe('#1f2937');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    expect(await text()).toBe('#f3f4f6');
  });

  test('wide screens get the left-to-right layouts, phones the top-to-bottom ones', async ({ page }) => {
    const map = page.locator('figure.decision-map').first();
    const grid = page.locator('figure.decision-figure').first();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(POST);
    await expect(map.locator('svg.map-wide')).toBeVisible();
    await expect(map.locator('svg.map-tall')).toBeHidden();
    await expect(grid.locator('svg.figure-wide')).toBeVisible();
    await expect(grid.locator('svg.figure-tall')).toBeHidden();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(map.locator('svg.map-tall')).toBeVisible();
    await expect(map.locator('svg.map-wide')).toBeHidden();
    await expect(grid.locator('svg.figure-tall')).toBeVisible();
    await expect(grid.locator('svg.figure-wide')).toBeHidden();
  });

  test('the post does not widen the page on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(POST);
    // Polled: until the post's figures settle, the page can be briefly wider.
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('the Confluence copy shows the PNGs instead', async ({ page }) => {
    await page.goto(`${POST}/confluence`);
    const body = page.locator('#body');
    await expect(body.locator('svg, figure')).toHaveCount(0);
    const srcs = await body.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
    const base = 'https://danielfridljand.de/images/blog/workflow-vs-agent';
    for (const png of [...PRESETS.map((p) => `map-${p}`), 'grid', 'coverage', 'unlock-tool']) {
      expect(srcs).toContain(`${base}/${png}.png`);
    }
  });
});
