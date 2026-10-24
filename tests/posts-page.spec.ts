import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

const POSTS = readdirSync('src/content/blog').filter((f) => /\.mdx?$/.test(f)).length;
const card = 'a[href^="/post/"] h3';

test.describe('Recent posts and the page of all posts', () => {
  test('the home page shows the five newest posts and links to all of them', async ({ page }) => {
    await page.goto('/');
    const recent = page.locator('#posts');
    await expect(recent.getByRole('heading', { name: 'Recent posts' })).toBeVisible();
    await expect(recent.locator(card)).toHaveCount(Math.min(5, POSTS));
    await recent.getByTestId('all-posts').click();
    await expect(page).toHaveURL(/\/posts$/);
  });

  test('the page of all posts lists every post while they fit on one page', async ({ page }) => {
    test.skip(POSTS > 50, 'more than one page of posts');
    await page.goto('/posts');
    await expect(page.locator(card)).toHaveCount(POSTS);
    await expect(page.getByTestId('posts-pagination')).toHaveCount(0);
  });

  test('a tag on a home page card opens all posts with that tag', async ({ page }) => {
    await page.goto('/');
    const tag = page.locator('#posts [data-testid^="post-tag-"]').first();
    const name = (await tag.textContent())!.trim();
    await tag.click();
    await expect(page).toHaveURL(new RegExp(`/posts\\?tags=${encodeURIComponent(name)}$`));
    await expect(page.getByTestId(`tag-filter-${name}`)).toHaveClass(/bg-link/);
  });
});
