import { test, expect, type Page } from '@playwright/test';

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

/**
 * The plain text the page puts on the clipboard. The page fills the clipboard
 * from a copy event, so we read the event: WebKit has no clipboard permissions
 * to grant for navigator.clipboard.readText().
 */
async function captureCopies(page: Page): Promise<() => Promise<string>> {
  await page.addInitScript(() => {
    // On window, so it runs after the page's handler on document has set the data.
    window.addEventListener('copy', (event) => {
      (window as unknown as { copied: string }).copied = event.clipboardData?.getData('text/plain') ?? '';
    });
  });
  return () => page.evaluate(() => (window as unknown as { copied: string }).copied);
}

test('the body copies as Markdown for Insert Markdown', async ({ page }) => {
  const copied = await captureCopies(page);
  await page.goto(`${POST}/confluence`);
  await page.getByRole('button', { name: 'Copy body as Markdown' }).click();
  await expect(page.getByRole('status')).toHaveText('Copied the markdown.');
  const markdown = await copied();
  expect(markdown).toMatch(/^## /m);
  expect(markdown).toContain('](https://danielfridljand.de/images/blog/the-missing-test-suite/shadow-timeline.png)');
});

test('the body copies as wiki markup with capped image widths', async ({ page }) => {
  const copied = await captureCopies(page);
  await page.goto(`${POST}/confluence`);
  await page.getByRole('button', { name: 'Copy body as wiki markup' }).click();
  await expect(page.getByRole('status')).toHaveText('Copied the wiki markup.');
  const wiki = await copied();
  expect(wiki).toMatch(/^h2\. /m);
  expect(wiki).not.toContain('Originally published');
  expect(wiki).toMatch(
    /!https:\/\/danielfridljand\.de\/images\/blog\/the-missing-test-suite\/shadow-timeline\.png\|width=\d+!/,
  );
  for (const [, width] of wiki.matchAll(/\|width=(\d+)!/g)) {
    expect(Number(width)).toBeLessThanOrEqual(760);
  }
});
