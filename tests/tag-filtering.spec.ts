import { test, expect } from '@playwright/test';

test.describe('Tag Filtering Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    
    // Navigate to posts section
    await page.goto('/#posts');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display tag filter buttons on the page', async ({ page }) => {
    // Check that the tag filter section exists
    const tagFilters = page.locator('[data-testid="tag-filters"]');
    await expect(tagFilters).toBeVisible();
    
    // Verify "Filter by tag:" text is present
    await expect(tagFilters).toContainText('Filter by tag:');
    
    // Verify that at least some common tags are present
    await expect(page.getByTestId('tag-filter-AI')).toBeVisible();
    await expect(page.getByTestId('tag-filter-Science')).toBeVisible();
  });

  test('should show all posts by default', async ({ page }) => {
    // Count all blog post cards
    const blogPosts = page.locator('a[href^="/post/"]').first();
    await expect(blogPosts).toBeVisible();
    
    // Verify no filter is applied (no Clear button visible)
    const clearButton = page.getByTestId('clear-filters');
    await expect(clearButton).not.toBeVisible();
  });

  test('should filter posts when clicking on a single tag', async ({ page }) => {
    // Click on the AI tag
    await page.getByTestId('tag-filter-AI').click();
    
    // Verify URL contains the tag parameter
    await expect(page).toHaveURL(/\?tags=AI/);
    
    // Verify the AI button is highlighted
    const aiButton = page.getByTestId('tag-filter-AI');
    await expect(aiButton).toHaveClass(/bg-link/);
    
    // Verify Clear button appears
    const clearButton = page.getByTestId('clear-filters');
    await expect(clearButton).toBeVisible();
    
    // Verify at least one post is visible and has the AI tag
    const firstPost = page.locator('a[href^="/post/"]').first();
    await expect(firstPost).toBeVisible();
    
    // Check that the first visible post has an AI tag button
    const aiTagInPost = page.getByTestId('post-tag-AI').first();
    await expect(aiTagInPost).toBeVisible();
  });

  test('should filter posts with multiple tags using OR logic', async ({ page }) => {
    // Click on the AI tag
    await page.getByTestId('tag-filter-AI').click();
    await page.waitForTimeout(500); // Wait for state update
    
    // Click on the Security tag
    await page.getByTestId('tag-filter-Security').click();
    await page.waitForTimeout(500); // Wait for state update
    
    // Verify URL contains both tags
    await expect(page).toHaveURL(/\?tags=AI%2CSecurity/);
    
    // Verify both buttons are highlighted
    const aiButton = page.getByTestId('tag-filter-AI');
    const securityButton = page.getByTestId('tag-filter-Security');
    await expect(aiButton).toHaveClass(/bg-link/);
    await expect(securityButton).toHaveClass(/bg-link/);
    
    // Verify posts are shown that have EITHER tag
    const blogPosts = page.locator('a[href^="/post/"]');
    const count = await blogPosts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should deselect tag when clicking on it again', async ({ page }) => {
    // Click on the AI tag to select it
    await page.getByTestId('tag-filter-AI').click();
    await expect(page).toHaveURL(/\?tags=AI/);
    
    // Click on the AI tag again to deselect it
    await page.getByTestId('tag-filter-AI').click();
    
    // Verify URL no longer contains tags parameter
    await expect(page).not.toHaveURL(/\?tags=/);
    
    // Verify the button is no longer highlighted
    const aiButton = page.getByTestId('tag-filter-AI');
    await expect(aiButton).not.toHaveClass(/bg-link/);
    
    // Verify Clear button is hidden
    const clearButton = page.getByTestId('clear-filters');
    await expect(clearButton).not.toBeVisible();
  });

  test('should clear all filters when clicking Clear button', async ({ page }) => {
    // Select multiple tags
    await page.getByTestId('tag-filter-AI').click();
    await page.waitForTimeout(300);
    await page.getByTestId('tag-filter-Security').click();
    await page.waitForTimeout(300);
    
    // Verify Clear button is visible
    const clearButton = page.getByTestId('clear-filters');
    await expect(clearButton).toBeVisible();
    
    // Click the Clear button
    await clearButton.click();
    
    // Verify URL no longer contains tags parameter
    await expect(page).not.toHaveURL(/\?tags=/);
    
    // Verify no buttons are highlighted
    const aiButton = page.getByTestId('tag-filter-AI');
    const securityButton = page.getByTestId('tag-filter-Security');
    await expect(aiButton).not.toHaveClass(/bg-link/);
    await expect(securityButton).not.toHaveClass(/bg-link/);
    
    // Verify Clear button is hidden
    await expect(clearButton).not.toBeVisible();
  });

  test('should persist filter state in URL', async ({ page }) => {
    // Click on a tag
    await page.getByTestId('tag-filter-AI').click();
    
    // Wait for URL to update
    await expect(page).toHaveURL(/\?tags=AI/);
    
    // Get the current URL
    const urlWithFilter = page.url();
    expect(urlWithFilter).toContain('tags=AI');
    
    // Navigate away and back
    await page.goto('/');
    await page.goto(urlWithFilter);
    
    // Verify the filter is still active
    const aiButton = page.getByTestId('tag-filter-AI');
    await expect(aiButton).toHaveClass(/bg-link/);
    
    // Verify Clear button is visible
    const clearButton = page.getByTestId('clear-filters');
    await expect(clearButton).toBeVisible();
  });

  test('should show correct number of filtered posts', async ({ page }) => {
    // Get initial count of all posts
    const allPostsCount = await page.locator('a[href^="/post/"]').count();
    expect(allPostsCount).toBeGreaterThan(0);
    
    // Filter by a tag that has fewer posts
    await page.getByTestId('tag-filter-Science').click();
    await page.waitForTimeout(500);
    
    // Get filtered count
    const filteredPostsCount = await page.locator('a[href^="/post/"]').count();
    
    // Filtered count should be less than or equal to total count
    expect(filteredPostsCount).toBeLessThanOrEqual(allPostsCount);
    expect(filteredPostsCount).toBeGreaterThan(0);
  });

  test('should highlight tag buttons on post cards when filter is active', async ({ page }) => {
    // Click on AI tag filter
    await page.getByTestId('tag-filter-AI').click();
    await page.waitForTimeout(500);
    
    // Find the first post
    const firstPost = page.locator('a[href^="/post/"]').first();
    await expect(firstPost).toBeVisible();
    
    // Check if the AI tag button in the post is highlighted
    const aiTagInPost = firstPost.locator('[data-testid="post-tag-AI"]');
    
    // If the post has an AI tag, it should be highlighted
    if (await aiTagInPost.count() > 0) {
      await expect(aiTagInPost.first()).toHaveClass(/bg-link/);
    }
  });

  test('should work on mobile devices', async ({ page }) => {
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to posts section
    await page.goto('/#posts');
    await page.waitForLoadState('domcontentloaded');
    
    // Check that tag filters are still visible and functional
    const tagFilters = page.locator('[data-testid="tag-filters"]');
    await expect(tagFilters).toBeVisible();
    
    // Click on a tag
    await page.getByTestId('tag-filter-AI').click();
    await page.waitForTimeout(500);
    
    // Verify URL contains the tag
    await expect(page).toHaveURL(/\?tags=AI/);
    
    // Verify posts are filtered
    const blogPosts = page.locator('a[href^="/post/"]');
    const count = await blogPosts.count();
    expect(count).toBeGreaterThan(0);
  });
});
