import { test, expect } from '@playwright/test';
import { expandChatAndAcceptConsent } from './helpers/chat';

test.describe('Privacy and consent', () => {
  test('should serve privacy policy page', async ({ page }) => {
    const response = await page.goto('/privacy');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeVisible();
    await expect(page.locator('article').getByRole('heading', { name: 'AI chat', level: 2 })).toBeVisible();
  });

  test('should link to privacy policy from footer', async ({ page }) => {
    await page.goto('/');
    const privacyLink = page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' });
    await expect(privacyLink).toBeVisible();
    await privacyLink.click();
    await page.waitForURL('**/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeVisible();
  });

  test('should show chat consent panel before accepting', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.removeItem('chat-consent'));

    const minimizedButton = page.locator('button[aria-label="Open chat"]');
    if (await minimizedButton.isVisible().catch(() => false)) {
      await minimizedButton.click();
    }

    await expect(page.getByTestId('chat-consent-panel')).toBeVisible();
    await expect(page.getByTestId('chat-form')).not.toBeVisible();
  });

  test('should enable chat after accepting consent', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.removeItem('chat-consent'));
    await expandChatAndAcceptConsent(page);

    await expect(page.getByTestId('chat-consent-panel')).not.toBeVisible();
    await expect(page.getByTestId('chat-form')).toBeVisible();

    const consent = await page.evaluate(() => sessionStorage.getItem('chat-consent'));
    expect(consent).toBe('true');
  });

  test('should have accessible name on chat input', async ({ page }) => {
    await page.goto('/');
    await expandChatAndAcceptConsent(page);

    const chatInput = page.locator('#chat-input');
    await expect(chatInput).toHaveAttribute('id', 'chat-input');
    await expect(page.locator('label[for="chat-input"]')).toBeAttached();
  });
});

test.describe('Accessibility', () => {
  test('should have skip link targeting main content', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeAttached();
    await expect(page.locator('#main-content')).toBeAttached();
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });
});
