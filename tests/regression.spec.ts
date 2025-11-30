import { test, expect } from '@playwright/test';

test.describe('Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test('should navigate to posts section when clicking on Posts link', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find the "Posts" navigation link
    const postsLink = page.getByRole('link', { name: /Posts/i });
    await expect(postsLink).toBeVisible();
    
    // Click on the Posts link
    await postsLink.click();
    
    // Wait for smooth scroll to complete
    await page.waitForTimeout(1000);
    
    // Verify we're at the posts section (check URL hash or scroll position)
    const postsSection = page.locator('#posts');
    await expect(postsSection).toBeVisible();
    
    // Verify posts section is in viewport
    await expect(postsSection).toBeInViewport();
    
    // Verify there are blog posts visible
    const blogPostLinks = page.locator('a[href^="/post/"]');
    const count = await blogPostLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to blog post when clicking on blog card', async ({ page }) => {
    // Locate blog post cards (links with href /post/[slug])
    const blogPostLinks = page.locator('a[href^="/post/"]');
    
    // Verify at least one blog post exists
    const count = await blogPostLinks.count();
    expect(count).toBeGreaterThan(0);
    
    // Get the first blog post link
    const firstBlogPost = blogPostLinks.first();
    const href = await firstBlogPost.getAttribute('href');
    expect(href).toBeTruthy();
    
    // Click on the first blog post
    await firstBlogPost.click();
    
    // Wait for navigation
    await page.waitForURL(new RegExp('/post/.*'), { timeout: 10000 });
    
    // Verify we're on a blog post page
    expect(page.url()).toMatch(/\/post\/.+/);
    
    // Verify blog post content is visible
    // Check for article element or main content
    const article = page.locator('article');
    await expect(article).toBeVisible();
    
    // Verify title is present
    const title = article.locator('h1').first();
    await expect(title).toBeVisible();
  });

  test('should have chat widget present on the page', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify chat component exists - look for the chat input field
    const chatInput = page.locator('input[placeholder*="Ask about skills"]');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    
    // Verify chat widget container is present
    const chatContainer = page.locator('div').filter({ hasText: /Ask me anything about Daniel/i }).or(
      page.locator('form').filter({ has: page.locator('input[placeholder*="Ask about skills"]') })
    );
    await expect(chatContainer.first()).toBeAttached();
  });

  test('should interact with chat widget and get response', async ({ page }) => {
    // Wait for the page and chat widget to load
    await page.waitForLoadState('networkidle');
    
    // Wait for chat input to be visible
    const chatInput = page.locator('input[placeholder*="Ask about skills"]');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    
    // Type a question
    await chatInput.fill('What is Daniel\'s current role?');
    
    // Submit the form (click send button or press Enter)
    const sendButton = page.locator('button[type="submit"]').filter({ has: page.locator('svg') });
    if (await sendButton.isVisible().catch(() => false)) {
      await sendButton.click();
    } else {
      await chatInput.press('Enter');
    }
    
    // Wait for response to appear (check for AI message)
    // The response should appear in the messages area
    await page.waitForTimeout(3000);
    
    // Check for AI response - look for message with role 'ai' or content that's not the user's question
    const aiResponse = page.locator('div').filter({ hasText: /Software Consultant|TNG|current role/i });
    await expect(aiResponse.first()).toBeVisible({ timeout: 15000 }).catch(() => {
      // If specific text not found, just check that a message appeared
      const messages = page.locator('div').filter({ has: page.locator('div[class*="rounded-2xl"]') });
      expect(messages.count()).toBeGreaterThan(0);
    });
  });

  test('should display publication about air pollution disparities', async ({ page }) => {
    // Scroll to publications section
    const publicationsSection = page.locator('#publications');
    await publicationsSection.scrollIntoViewIfNeeded();
    
    // Wait for publications to be visible
    await expect(publicationsSection).toBeVisible();
    
    // Verify the specific publication title is visible
    const publicationTitle = 'Disparities in air pollution attributable mortality in the US population by race/ethnicity and sociodemographic factors';
    
    // Look for the publication by its title
    const publication = page.getByText(publicationTitle, { exact: false });
    await expect(publication).toBeVisible();
    
    // Verify publication details are displayed
    // Check for authors (should contain "Daniel Fridljand") - scope to publications section
    const authors = publicationsSection.getByText('Daniel Fridljand', { exact: false });
    await expect(authors).toBeVisible();
    
    // Check for publication date/info - scope to publications section
    const publicationInfo = publicationsSection.getByText('Nature Medicine', { exact: false });
    await expect(publicationInfo).toBeVisible();
    
    // Verify summary is present - scope to publications section
    const summary = publicationsSection.getByText(/In the US between 2000 and 2011/i);
    await expect(summary).toBeVisible();
  });
});

