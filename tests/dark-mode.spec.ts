import { test, expect } from '@playwright/test';

test.describe('Dark Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should toggle dark mode on and off', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Initially should be in light mode (no dark class)
    const initialTheme = await page.evaluate(() => {
      return {
        hasDarkClass: document.documentElement.classList.contains('dark'),
        localStorage: localStorage.getItem('color-theme')
      };
    });
    
    // Should start in light mode (no localStorage set yet)
    expect(initialTheme.hasDarkClass).toBe(false);
    expect(initialTheme.localStorage).toBeNull();
    
    // Find and click the dark mode toggle button
    const toggleButton = page.getByRole('button', { name: /Toggle dark mode/i });
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();
    
    // Wait a moment for the toggle to complete
    await page.waitForTimeout(100);
    
    // Verify dark mode is now enabled
    const darkModeState = await page.evaluate(() => {
      return {
        hasDarkClass: document.documentElement.classList.contains('dark'),
        localStorage: localStorage.getItem('color-theme'),
        bodyBg: window.getComputedStyle(document.body).backgroundColor
      };
    });
    
    expect(darkModeState.hasDarkClass).toBe(true);
    expect(darkModeState.localStorage).toBe('dark');
    // In dark mode, background should be a dark color (not white)
    expect(darkModeState.bodyBg).not.toBe('rgb(255, 255, 255)');
    
    // Toggle back to light mode
    await toggleButton.click();
    await page.waitForTimeout(100);
    
    // Verify light mode is restored
    const lightModeState = await page.evaluate(() => {
      return {
        hasDarkClass: document.documentElement.classList.contains('dark'),
        localStorage: localStorage.getItem('color-theme'),
        bodyBg: window.getComputedStyle(document.body).backgroundColor
      };
    });
    
    expect(lightModeState.hasDarkClass).toBe(false);
    expect(lightModeState.localStorage).toBe('light');
    expect(lightModeState.bodyBg).toBe('rgb(255, 255, 255)');
  });

  test('should persist dark mode preference across page reloads', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Enable dark mode
    const toggleButton = page.getByRole('button', { name: /Toggle dark mode/i });
    await toggleButton.click();
    await page.waitForTimeout(100);
    
    // Verify dark mode is enabled
    let isDarkMode = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    expect(isDarkMode).toBe(true);
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Dark mode should still be enabled after reload
    const darkModeState = await page.evaluate(() => {
      return {
        hasDarkClass: document.documentElement.classList.contains('dark'),
        localStorage: localStorage.getItem('color-theme')
      };
    });
    
    expect(darkModeState.hasDarkClass).toBe(true);
    expect(darkModeState.localStorage).toBe('dark');
  });

  test('should show correct icon for current mode', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const toggleButton = page.getByRole('button', { name: /Toggle dark mode/i });
    
    // In light mode, moon icon should be visible (to switch to dark)
    const moonIcon = page.locator('#theme-toggle-dark-icon');
    const sunIcon = page.locator('#theme-toggle-light-icon');
    
    await expect(moonIcon).toBeVisible();
    await expect(sunIcon).not.toBeVisible();
    
    // Click to switch to dark mode
    await toggleButton.click();
    await page.waitForTimeout(100);
    
    // In dark mode, sun icon should be visible (to switch to light)
    await expect(moonIcon).not.toBeVisible();
    await expect(sunIcon).toBeVisible();
  });
});
