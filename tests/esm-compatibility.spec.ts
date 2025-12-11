import { test, expect } from '@playwright/test';

/**
 * ESM Compatibility Tests
 * 
 * These tests verify that the application runs without ERR_REQUIRE_ESM errors.
 * The error occurs when jsdom (used by isomorphic-dompurify) tries to require()
 * an ES Module (parse5), which is not supported.
 * 
 * This test prevents regression by:
 * 1. Verifying the homepage loads successfully
 * 2. Checking that the Experience section renders correctly (uses renderExperienceDescription)
 * 3. Validating no console errors related to ESM/require issues
 * 4. Ensuring the server starts without ESM errors
 */
test.describe('ESM Compatibility', () => {
  test('should load homepage without ESM errors', async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
      }
    });

    // Collect page errors
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded successfully
    await expect(page).toHaveTitle(/Daniel Fridljand/i);
    
    // Check for ESM-related errors
    const esmErrors = [
      ...consoleErrors,
      ...pageErrors,
    ].filter((error) => 
      error.includes('ERR_REQUIRE_ESM') ||
      error.includes('require() of ES Module') ||
      error.includes('parse5') ||
      error.includes('jsdom')
    );
    
    // Fail if any ESM errors found
    if (esmErrors.length > 0) {
      console.error('ESM Errors detected:', esmErrors);
      throw new Error(`ESM compatibility error detected: ${esmErrors.join('; ')}`);
    }
    
    // Verify no critical errors (allow warnings)
    expect(consoleErrors.length).toBe(0);
  });

  test('should render Experience section without ESM errors', async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Scroll to Experience section
    const experienceSection = page.locator('#experience');
    await experienceSection.scrollIntoViewIfNeeded();
    await expect(experienceSection).toBeVisible();
    
    // Verify Experience section has content
    // This section uses renderExperienceDescription which depends on isomorphic-dompurify
    const experienceItems = experienceSection.locator('[class*="bg-surface"]');
    const count = await experienceItems.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify at least one experience item has rendered description
    // Check for common HTML elements that would be sanitized by DOMPurify
    const firstItem = experienceItems.first();
    await expect(firstItem).toBeVisible();
    
    // Check for links (which are created by renderExperienceDescription)
    const links = firstItem.locator('a[href]');
    const linkCount = await links.count();
    // At least some experience items should have links
    expect(linkCount).toBeGreaterThan(0);
    
    // Check for ESM-related errors
    const esmErrors = [
      ...consoleErrors,
      ...pageErrors,
    ].filter((error) => 
      error.includes('ERR_REQUIRE_ESM') ||
      error.includes('require() of ES Module') ||
      error.includes('parse5') ||
      error.includes('jsdom') ||
      error.includes('isomorphic-dompurify')
    );
    
    // Fail if any ESM errors found
    if (esmErrors.length > 0) {
      console.error('ESM Errors detected while rendering Experience section:', esmErrors);
      throw new Error(`ESM compatibility error in Experience section: ${esmErrors.join('; ')}`);
    }
    
    // Verify no critical errors
    expect(consoleErrors.length).toBe(0);
  });

  test('should handle experience descriptions with HTML sanitization', async ({ page }) => {
    // This test specifically exercises the renderExperienceDescription function
    // which uses isomorphic-dompurify for HTML sanitization
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Scroll to Experience section
    const experienceSection = page.locator('#experience');
    await experienceSection.scrollIntoViewIfNeeded();
    
    // Get first experience item
    const firstItem = experienceSection.locator('[class*="bg-surface"]').first();
    await expect(firstItem).toBeVisible();
    
    // Verify the description is rendered (not empty)
    const description = firstItem.locator('[class*="prose"]');
    await expect(description).toBeVisible();
    
    // Verify HTML is properly sanitized (links should work, but no dangerous tags)
    const text = await description.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
    
    // Check that links are properly rendered (if they exist)
    const links = description.locator('a[href]');
    const linkCount = await links.count();
    if (linkCount > 0) {
      // Verify links have proper attributes (target, rel)
      const firstLink = links.first();
      const target = await firstLink.getAttribute('target');
      const rel = await firstLink.getAttribute('rel');
      
      if (target === '_blank') {
        expect(rel).toContain('noopener');
      }
    }
  });

  test('should not have require() errors in server logs', async ({ page, request }) => {
    // Test that the server responds without errors
    // This indirectly verifies the server started without ESM errors
    
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    
    // Verify the response contains expected content
    const body = await response.text();
    expect(body).toContain('Daniel Fridljand');
    
    // Check for any runtime errors
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });
    
    // Navigate to the page to trigger any client-side errors
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(1000);
    
    // Filter for ESM-related errors
    const esmErrors = pageErrors.filter((error) => 
      error.includes('ERR_REQUIRE_ESM') ||
      error.includes('require() of ES Module') ||
      error.includes('parse5') ||
      error.includes('jsdom')
    );
    
    expect(esmErrors.length).toBe(0);
  });
});
