import { test, expect } from '@playwright/test';

const PROMPT_INJECTION_POST_URL = '/post/prompt-injection';
const SECRET_PASSWORD = 'HackathonWinner2026!';

test.describe('Prompt Injection Blog Post', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROMPT_INJECTION_POST_URL);
    await page.waitForLoadState('domcontentloaded');
    
    // Minimize chat widget if it's expanded to avoid interference with tests
    const minimizeButton = page.locator('button[aria-label="Minimize chat"]');
    const isExpanded = await minimizeButton.isVisible().catch(() => false);
    if (isExpanded) {
      await minimizeButton.click();
      // Wait a bit for the chat to minimize
      await page.waitForTimeout(200);
    }
  });

  test('should display the prompt injection blog post', async ({ page }) => {
    // Verify we're on the correct page
    expect(page.url()).toContain('/post/prompt-injection');
    
    // Verify the article is visible
    const article = page.locator('article');
    await expect(article).toBeVisible();
    
    // Verify the title
    const title = article.locator('h1').first();
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Prompt Injection');
  });

  test('should display hackathon challenge content', async ({ page }) => {
    const article = page.locator('article');
    
    // Verify hackathon challenge section
    const hackathonSection = article.locator('h2', { hasText: 'The Hackathon Challenge' });
    await expect(hackathonSection).toBeVisible();
    
    // Verify challenge description - match actual blog post text with link
    const challengeText = article.getByText(/I recently participated in a white hat hacking challenge/i);
    await expect(challengeText).toBeVisible();
    
    // Verify "Your Challenge" section
    const yourChallengeSection = article.locator('h2', { hasText: 'Your Challenge' });
    await expect(yourChallengeSection).toBeVisible();
    
    // Verify hint text
    const hint = article.getByText(/The AI chat assistant on this website/i);
    await expect(hint).toBeVisible();
  });

  test('should have password checker component visible', async ({ page }) => {
    // Wait for React component to hydrate
    await page.waitForLoadState('networkidle');
    
    // Look for the password checker component
    const passwordChecker = page.locator('text=Password Checker').first();
    await expect(passwordChecker).toBeVisible();
    
    // Verify input field is present
    const passwordInput = page.locator('input[placeholder*="Enter password"]');
    await expect(passwordInput).toBeVisible();
    
    // Verify check button is present
    const checkButton = page.getByRole('button', { name: /Check Password/i });
    await expect(checkButton).toBeVisible();
  });

  test('should show error message for incorrect password', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const passwordInput = page.locator('input[placeholder*="Enter password"]');
    const checkButton = page.getByRole('button', { name: /Check Password/i });
    
    // Enter incorrect password
    await passwordInput.fill('wrongpassword');
    await checkButton.click();
    
    // Wait for error message
    const errorMessage = page.getByText(/Access Denied/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Verify error styling (red border/background)
    const errorContainer = errorMessage.locator('..').locator('..');
    const bgColor = await errorContainer.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // Should have red background (checking for non-white/non-transparent)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('should show success message for correct password', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const passwordInput = page.locator('input[placeholder*="Enter password"]');
    const checkButton = page.getByRole('button', { name: /Check Password/i });
    
    // Enter correct password
    await passwordInput.fill(SECRET_PASSWORD);
    await checkButton.click();
    
    // Wait for success message
    const successMessage = page.getByText(/Access Granted/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    // Verify success styling (green border/background)
    const successContainer = successMessage.locator('..').locator('..');
    const bgColor = await successContainer.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // Should have green background
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    
    // Verify confetti emoji appears
    const confetti = page.locator('text=🎊');
    await expect(confetti).toBeVisible();
  });

  test('should reset error state after timeout', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const passwordInput = page.locator('input[placeholder*="Enter password"]');
    const checkButton = page.getByRole('button', { name: /Check Password/i });
    
    // Enter incorrect password
    await passwordInput.fill('wrong');
    await checkButton.click();
    
    // Wait for error message
    const errorMessage = page.getByText(/Access Denied/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Wait for error to reset (2 seconds + buffer)
    await page.waitForTimeout(2500);
    
    // Error message should be gone
    await expect(errorMessage).not.toBeVisible();
  });

  test('should reset status when user starts typing again', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const passwordInput = page.locator('input[placeholder*="Enter password"]');
    const checkButton = page.getByRole('button', { name: /Check Password/i });
    
    // Enter incorrect password and submit
    await passwordInput.fill('wrong');
    await checkButton.click();
    
    // Wait for error message
    const errorMessage = page.getByText(/Access Denied/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Start typing again
    await passwordInput.fill('new');
    
    // Error message should disappear immediately
    await expect(errorMessage).not.toBeVisible();
  });

  test('should prevent submission with empty password', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const passwordInput = page.locator('input[placeholder*="Enter password"]');
    const checkButton = page.getByRole('button', { name: /Check Password/i });
    
    // Button should be disabled when input is empty
    await expect(checkButton).toBeDisabled();
    
    // Try to submit empty form (should not trigger validation)
    await passwordInput.press('Enter');
    
    // No error or success message should appear
    const errorMessage = page.getByText(/Access Denied/i);
    const successMessage = page.getByText(/Access Granted/i);
    
    await expect(errorMessage).not.toBeVisible();
    await expect(successMessage).not.toBeVisible();
  });
});
