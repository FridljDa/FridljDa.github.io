import { test, expect } from '@playwright/test';

test.describe('Blog Post Heading Formatting', () => {
  test('should display section headings with proper heading font weight', async ({ page }) => {
    // Navigate to a blog post
    await page.goto('/post/mutational-signature-with-hierarchical-dirichlet-process');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that h2 headings have proper font weight
    const h2Headings = page.locator('article h2');
    const h2Count = await h2Headings.count();
    expect(h2Count).toBeGreaterThan(0);
    
    // Check the first h2 heading ("Introduction")
    const firstH2 = h2Headings.first();
    await expect(firstH2).toBeVisible();
    
    // Get the computed font-weight of the heading
    const fontWeight = await firstH2.evaluate((el) => {
      return window.getComputedStyle(el).fontWeight;
    });
    
    // Font weight should be bold (700 or greater)
    // In Tailwind Typography, h2 typically has font-weight: 700
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(600);
  });

  test('should display h3 headings with proper font weight', async ({ page }) => {
    // Navigate to a blog post
    await page.goto('/post/mutational-signature-with-hierarchical-dirichlet-process');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that h3 headings have proper font weight
    const h3Headings = page.locator('article h3');
    const h3Count = await h3Headings.count();
    expect(h3Count).toBeGreaterThan(0);
    
    // Check the first h3 heading
    const firstH3 = h3Headings.first();
    await expect(firstH3).toBeVisible();
    
    // Get the computed font-weight of the heading
    const fontWeight = await firstH3.evaluate((el) => {
      return window.getComputedStyle(el).fontWeight;
    });
    
    // Font weight should be bold (600 or greater)
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(600);
  });

  test('should display h4 headings with proper font weight', async ({ page }) => {
    // Navigate to a blog post
    await page.goto('/post/mutational-signature-with-hierarchical-dirichlet-process');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that h4 headings have proper font weight
    const h4Headings = page.locator('article h4');
    const h4Count = await h4Headings.count();
    expect(h4Count).toBeGreaterThan(0);
    
    // Check the first h4 heading
    const firstH4 = h4Headings.first();
    await expect(firstH4).toBeVisible();
    
    // Get the computed font-weight of the heading
    const fontWeight = await firstH4.evaluate((el) => {
      return window.getComputedStyle(el).fontWeight;
    });
    
    // Font weight should be bold (600 or greater)
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(600);
  });

  test('should have heading links inherit font properties from parent heading', async ({ page }) => {
    // Navigate to a blog post
    await page.goto('/post/mutational-signature-with-hierarchical-dirichlet-process');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
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
    // Navigate to a blog post
    await page.goto('/post/mutational-signature-with-hierarchical-dirichlet-process');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
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
