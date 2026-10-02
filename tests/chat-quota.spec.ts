import { test, expect, type Route } from '@playwright/test';
import { expandChatAndAcceptConsent } from './helpers/chat';

const RESETS_AT = '2030-01-01T08:00:00.000Z';

test.describe('Chat quota', () => {
  test('should report the questions left today from the API', async ({ request }) => {
    const response = await request.get('/api/chat');
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toBe('no-store');

    const quota = await response.json();
    expect(quota.remaining).toBeGreaterThanOrEqual(0);
    expect(typeof quota.exhausted).toBe('boolean');
    expect(Date.parse(quota.resetsAt)).toBeGreaterThan(Date.now());
  });

  test('should show the questions left and refresh them after each answer', async ({ page }) => {
    let remaining = 42;
    await page.route('/api/chat', async (route: Route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: { remaining, exhausted: false, resetsAt: RESETS_AT } });
        return;
      }
      remaining -= 1;
      await route.fulfill({
        status: 200,
        contentType: 'text/plain; charset=utf-8',
        body: 'Daniel is an AI Engineer.',
      });
    });

    await page.goto('/');
    await expandChatAndAcceptConsent(page);

    const counter = page.getByTestId('chat-quota');
    await expect(counter).toHaveText('42 questions left today');

    const chatInput = page.locator('#chat-input');
    await chatInput.pressSequentially('What is his role?', { delay: 10 });
    await chatInput.press('Enter');

    await expect(page.getByText('Daniel is an AI Engineer.')).toBeVisible();
    await expect(counter).toHaveText('41 questions left today');
  });

  test('should disable input once the daily quota is used up', async ({ page }) => {
    let exhausted = false;
    await page.route('/api/chat', async (route: Route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: { remaining: exhausted ? 0 : 1, exhausted, resetsAt: RESETS_AT },
        });
        return;
      }
      exhausted = true;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'All models exhausted',
          message: 'All available Gemini models have reached their rate limits. Please try again later.',
        }),
      });
    });

    await page.goto('/');
    await expandChatAndAcceptConsent(page);
    await expect(page.getByTestId('chat-quota')).toHaveText('1 question left today');

    const chatInput = page.locator('#chat-input');
    await chatInput.pressSequentially('One more question', { delay: 10 });
    await chatInput.press('Enter');

    await expect(page.getByText(/The daily usage limit has been reached/)).toBeVisible();
    await expect(page.getByTestId('chat-quota')).toHaveText('0 questions left today');
    await expect(chatInput).toBeDisabled();
    await expect(chatInput).toHaveAttribute('placeholder', /Daily quota used up until/);
  });
});
