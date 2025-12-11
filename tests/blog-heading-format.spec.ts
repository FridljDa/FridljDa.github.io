import { test, expect } from '@playwright/test';

const BLOG_POST_URL = '/post/mutational-signature-with-hierarchical-dirichlet-process';

test.describe('Blog Post Heading Formatting', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the blog post and wait for it to load
    await page.goto(BLOG_POST_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display section headings (h2, h3, h4) with proper heading font weight', async ({ page }) => {
    // Test all heading levels in a single parameterized test
    const headingLevels = ['h2', 'h3', 'h4'] as const;
    
    for (const level of headingLevels) {
      // Check that headings of this level have proper font weight
      const headings = page.locator(`article ${level}`);
      const count = await headings.count();
      expect(count).toBeGreaterThan(0);
      
      // Check the first heading of this level
      const firstHeading = headings.first();
      await expect(firstHeading).toBeVisible();
      
      // Get the computed font-weight of the heading
      const fontWeight = await firstHeading.evaluate((el) => {
        return window.getComputedStyle(el).fontWeight;
      });
      
      // Font weight should be bold (600 or greater)
      expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(600);
    }
  });

  test('should have heading links inherit font properties from parent heading', async ({ page }) => {
    
    // Get an h2 heading link
    const h2Link = page.locator('article h2 a.heading-link').first();
    await expect(h2Link).toBeVisible();
    
    // Get the computed styles of the link
    const linkStyles = await h2Link.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        fontWeight: styles.fontWeight,
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
      };
    });
    
    // Get the computed styles of the parent h2
    const h2Styles = await page.locator('article h2').first().evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        fontWeight: styles.fontWeight,
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
      };
    });
    
    // The link should inherit the same font properties as the heading
    expect(linkStyles.fontWeight).toBe(h2Styles.fontWeight);
    expect(linkStyles.fontSize).toBe(h2Styles.fontSize);
    expect(linkStyles.lineHeight).toBe(h2Styles.lineHeight);
    
    // Font weight should be bold
    expect(parseInt(linkStyles.fontWeight)).toBeGreaterThanOrEqual(600);
  });

  test('should not style heading links as regular links', async ({ page }) => {
    
    // Get an h2 heading link
    const h2Link = page.locator('article h2 a.heading-link').first();
    await expect(h2Link).toBeVisible();
    
    // Get a regular prose link for comparison
    const regularLink = page.locator('article .prose p a').first();
    await expect(regularLink).toBeVisible();
    
    // Get the computed font-weight of both
    const headingLinkWeight = await h2Link.evaluate((el) => {
      return window.getComputedStyle(el).fontWeight;
    });
    
    const regularLinkWeight = await regularLink.evaluate((el) => {
      return window.getComputedStyle(el).fontWeight;
    });
    
    // Heading link should be bold (inherit from h2), regular link should be normal
    expect(parseInt(headingLinkWeight)).toBeGreaterThan(parseInt(regularLinkWeight));
    expect(parseInt(headingLinkWeight)).toBeGreaterThanOrEqual(600);
  });
});
