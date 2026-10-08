import { test, expect } from '@playwright/test';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LINKEDIN } from '../src/utils/linkedin';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slugs = (dir: string, ext: RegExp) =>
  readdirSync(path.join(root, dir))
    .filter((file) => ext.test(file))
    .map((file) => file.replace(ext, ''));

const reposts = slugs('src/content/reposts/linkedin', /\.md$/);
const withoutRepost = slugs('src/content/blog', /\.mdx?$/).find((slug) => !reposts.includes(slug));

test.describe('LinkedIn copy of a post', () => {
  for (const slug of reposts) {
    test(`${slug}: fits LinkedIn and links back`, async ({ page }) => {
      // A 200 also means the filename matches a blog post.
      const response = await page.goto(`/post/${slug}/linkedin`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');

      const count = page.locator('#count');
      const length = Number(await count.getAttribute('data-length'));
      expect(length).toBeGreaterThan(0);
      expect(length).toBeLessThanOrEqual(LINKEDIN.maxPostLength);

      // The fold markers are not part of the text that gets copied.
      const text = await page.locator('[data-what="text"]').getAttribute('data-copy');
      expect(text, 'LinkedIn shows Markdown literally').not.toMatch(/\*\*|\]\(|^#{1,6} |^\|/m);

      const copies = await page.locator('[data-copy]').evaluateAll((buttons) =>
        buttons.filter((b) => b.getAttribute('data-what') !== 'post link').map((b) => b.getAttribute('data-copy')),
      );
      expect(copies.join('\n'), 'link the original post in the text or first comment').toContain(
        `https://danielfridljand.de/post/${slug}`,
      );

      for (const img of await page.locator('#images img').all()) {
        await expect(img).toHaveJSProperty('complete', true);
        const src = (await img.getAttribute('src')) ?? '';
        expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth), src).toBeGreaterThan(0);
      }
    });
  }

  test('a post without a LinkedIn version has no copy page', async ({ page }) => {
    test.skip(!withoutRepost, 'every post has a LinkedIn version');
    const response = await page.goto(`/post/${withoutRepost}/linkedin`);
    expect(response?.status()).toBe(404);
  });

  test('reposts stay off the site', async ({ page }) => {
    for (const url of ['/', '/sitemap.xml', '/index.md']) {
      const response = await page.request.get(url);
      const body = await response.text();
      for (const slug of reposts) {
        expect(body, url).not.toContain(`/post/${slug}/linkedin`);
      }
    }
  });
});
