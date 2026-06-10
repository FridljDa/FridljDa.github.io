import { test, expect } from '@playwright/test';

test.describe('Dark Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
  });

  test('should toggle dark mode on and off', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    const initialTheme = await page.evaluate(() => ({
      hasDarkClass: document.documentElement.classList.contains('dark'),
    }));

    expect(initialTheme.hasDarkClass).toBe(false);

    const toggleButton = page.getByRole('button', { name: /Toggle dark mode/i });
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();

    await page.waitForFunction(() => document.documentElement.classList.contains('dark'));

    const darkModeState = await page.evaluate(() => ({
      hasDarkClass: document.documentElement.classList.contains('dark'),
      bodyBg: window.getComputedStyle(document.body).backgroundColor,
    }));

    expect(darkModeState.hasDarkClass).toBe(true);
    expect(darkModeState.bodyBg).not.toBe('rgb(255, 255, 255)');

    await toggleButton.click();

    await page.waitForFunction(() => !document.documentElement.classList.contains('dark'));

    const lightModeState = await page.evaluate(() => ({
      hasDarkClass: document.documentElement.classList.contains('dark'),
      bodyBg: window.getComputedStyle(document.body).backgroundColor,
    }));

    expect(lightModeState.hasDarkClass).toBe(false);
    expect(lightModeState.bodyBg).toBe('rgb(255, 255, 255)');
  });

  test('should reset theme to system preference on reload', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    const toggleButton = page.getByRole('button', { name: /Toggle dark mode/i });
    await toggleButton.click();

    await page.waitForFunction(() => document.documentElement.classList.contains('dark'));

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const themeAfterReload = await page.evaluate(() => ({
      hasDarkClass: document.documentElement.classList.contains('dark'),
    }));

    expect(themeAfterReload.hasDarkClass).toBe(false);
  });

  test('should follow system dark preference on load', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const theme = await page.evaluate(() => ({
      hasDarkClass: document.documentElement.classList.contains('dark'),
    }));

    expect(theme.hasDarkClass).toBe(true);
  });

  test('should show correct icon for current mode', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    const toggleButton = page.getByRole('button', { name: /Toggle dark mode/i });
    const moonIcon = page.locator('#theme-toggle-dark-icon');
    const sunIcon = page.locator('#theme-toggle-light-icon');

    await expect(moonIcon).toBeVisible();
    await expect(sunIcon).not.toBeVisible();

    await toggleButton.click();

    await page.waitForFunction(() => document.documentElement.classList.contains('dark'));

    await expect(moonIcon).not.toBeVisible();
    await expect(sunIcon).toBeVisible();
  });
});
