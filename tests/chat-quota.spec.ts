import { test, expect, type Route } from '@playwright/test';
import { expandChatAndAcceptConsent } from './helpers/chat';

const RESETS_AT = '2030-01-01T08:00:00.000Z';

function quotaHeaders(remaining: number) {
  return {
    'X-Prompt-Limit': '10',
    'X-Prompt-Remaining': String(remaining),
    'X-Prompt-Reset': RESETS_AT,
  };
}

test.describe('Chat prompt quota', () => {
  test('should report the remaining prompts from the API', async ({ request }) => {
    const response = await request.get('/api/chat');
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toBe('no-store');

    const quota = await response.json();
    expect(quota.limit).toBeGreaterThan(0);
    expect(quota.remaining).toBeLessThanOrEqual(quota.limit);
    expect(Date.parse(quota.resetsAt)).toBeGreaterThan(Date.now());
  });

  test('should show the remaining prompts and update them after each answer', async ({ page }) => {
    await page.route('/api/chat', async (route: Route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: { limit: 10, used: 0, remaining: 10, resetsAt: RESETS_AT },
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'text/plain; charset=utf-8',
        headers: quotaHeaders(9),
        body: 'Daniel is an AI Engineer.',
      });
    });

    await page.goto('/');
    await expandChatAndAcceptConsent(page);

    const counter = page.getByTestId('chat-prompt-quota');
    await expect(counter).toHaveText('10 of 10 questions left');

    const chatInput = page.locator('#chat-input');
    await chatInput.pressSequentially('What is his role?', { delay: 10 });
    await chatInput.press('Enter');

    await expect(page.getByText('Daniel is an AI Engineer.')).toBeVisible();
    await expect(counter).toHaveText('9 of 10 questions left');
  });

  test('should explain the limit and disable input when no prompts are left', async ({ page }) => {
    await page.route('/api/chat', async (route: Route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: { limit: 10, used: 9, remaining: 1, resetsAt: RESETS_AT },
        });
        return;
      }
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        headers: quotaHeaders(0),
        body: JSON.stringify({ error: 'Prompt limit reached' }),
      });
    });

    await page.goto('/');
    await expandChatAndAcceptConsent(page);
    await expect(page.getByTestId('chat-prompt-quota')).toHaveText('1 of 10 questions left');

    const chatInput = page.locator('#chat-input');
    await chatInput.pressSequentially('One more question', { delay: 10 });
    await chatInput.press('Enter');

    await expect(page.getByText(/You've used all 10 questions for today/)).toBeVisible();
    await expect(page.getByTestId('chat-prompt-quota')).toHaveText('0 of 10 questions left');
    await expect(chatInput).toBeDisabled();
    await expect(chatInput).toHaveAttribute('placeholder', /No questions left until/);
  });
});
