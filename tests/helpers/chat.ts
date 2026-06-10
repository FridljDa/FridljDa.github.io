import { expect, type Page } from '@playwright/test';

export async function expandChatAndAcceptConsent(page: Page) {
  const minimizedButton = page.locator('button[aria-label="Open chat"]');
  if (await minimizedButton.isVisible().catch(() => false)) {
    await minimizedButton.click();
  }

  const consentPanel = page.getByTestId('chat-consent-panel');
  if (await consentPanel.isVisible().catch(() => false)) {
    await page.getByTestId('chat-consent-accept').click();
  }

  const chatInput = page.locator('#chat-input');
  await expect(chatInput).toBeVisible({ timeout: 10000 });
}
