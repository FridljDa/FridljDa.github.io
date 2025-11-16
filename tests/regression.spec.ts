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
    
    // Verify langflow-chat custom element exists in DOM
    const chatWidget = page.locator('langflow-chat');
    await expect(chatWidget).toBeAttached();
    
    // Verify chat widget is visible
    await expect(chatWidget).toBeVisible();
    
    // Verify chat widget has required attributes
    const flowId = await chatWidget.getAttribute('flow_id');
    expect(flowId).toBeTruthy();
    
    const hostUrl = await chatWidget.getAttribute('host_url');
    expect(hostUrl).toBeTruthy();
  });

  // TODO: Fix this test - chat widget interaction is failing
  // The chat widget doesn't appear to have shadow DOM or iframe structure
  // Need to investigate the actual DOM structure and interaction method
  test('should interact with chat widget and get response', async ({ page }) => {
    // Wait for the page and chat widget to load
    await page.waitForLoadState('networkidle');
    
    // Wait for langflow-chat element to be attached
    const chatWidget = page.locator('langflow-chat');
    await expect(chatWidget).toBeAttached({ timeout: 10000 });
    
    // Wait for the widget to fully initialize
    await page.waitForTimeout(3000);
    
    // Try to open the chat widget by clicking it
    // Use evaluate to handle shadow DOM if needed
    await page.evaluate(() => {
      const chatElement = document.querySelector('langflow-chat') as HTMLElement;
      if (!chatElement) return;
      
      // Try clicking the element directly first
      chatElement.click();
      
      // Also try finding and clicking a button in shadow DOM
      const shadowRoot = chatElement.shadowRoot;
      if (shadowRoot) {
        const button = shadowRoot.querySelector('button, [role="button"], [class*="button"]') as HTMLElement;
        if (button) {
          button.click();
        }
      }
    });
    
    // Also try Playwright click as fallback
    try {
      await chatWidget.click({ timeout: 2000, force: true });
    } catch (e) {
      // Ignore if click fails, JavaScript click might have worked
    }
    
    // Wait for chat window to open
    await page.waitForTimeout(2000);
    
    // Check for iframes first (langflow-chat might use iframe)
    const iframes = page.locator('iframe');
    const iframeCount = await iframes.count();
    
    if (iframeCount > 0) {
      // Try to interact with iframe content
      const iframe = iframes.first();
      const iframeContent = await iframe.contentFrame();
      
      if (iframeContent) {
        // Wait for iframe to load
        await iframeContent.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        
        // Find and interact with chat input in iframe
        const chatInput = iframeContent.locator('input, textarea, [contenteditable="true"]').first();
        await chatInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        await chatInput.fill('what does daniel do?', { timeout: 10000 });
        await chatInput.press('Enter');
        
        // Wait for response in iframe
        await page.waitForTimeout(5000);
        const iframeMessages = iframeContent.locator('.message, .chat-message, [class*="message"], [class*="response"]');
        const messageCount = await iframeMessages.count().catch(() => 0);
        expect(messageCount).toBeGreaterThan(0);
        return; // Exit early if iframe interaction worked
      }
    }
    
    // Try to interact with shadow DOM or regular DOM
    const messageSent = await page.evaluate(() => {
      const chatElement = document.querySelector('langflow-chat') as HTMLElement;
      if (!chatElement) return false;
      
      let input: HTMLElement | null = null;
      let sendButton: HTMLElement | null = null;
      
      // Try shadow DOM first
      const shadowRoot = chatElement.shadowRoot;
      if (shadowRoot) {
        input = shadowRoot.querySelector('input, textarea, [contenteditable="true"], [class*="input"]') as HTMLElement;
        sendButton = shadowRoot.querySelector('button[type="submit"], [class*="send"], [aria-label*="send" i]') as HTMLElement;
        if (!sendButton) {
          sendButton = Array.from(shadowRoot.querySelectorAll('button')).find(btn => 
            btn.textContent?.toLowerCase().includes('send')
          ) as HTMLElement || null;
        }
      }
      
      // If not in shadow DOM, try regular DOM
      if (!input) {
        input = chatElement.querySelector('input, textarea, [contenteditable="true"]') as HTMLElement;
      }
      if (!sendButton) {
        sendButton = chatElement.querySelector('button[type="submit"], [class*="send"]') as HTMLElement;
      }
      
      if (input) {
        // Set the value
        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
          input.value = 'what does daniel do?';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (input.contentEditable === 'true') {
          input.textContent = 'what does daniel do?';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Submit
        if (sendButton) {
          sendButton.click();
        } else {
          // Press Enter
          input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
          input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
        }
        return true;
      }
      
      return false;
    });
    
    // If JavaScript interaction didn't work, try regular DOM selectors
    if (!messageSent) {
      const chatInput = page.locator('input, textarea, [contenteditable="true"]').first();
      await chatInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      await chatInput.fill('what does daniel do?', { timeout: 10000 });
      await chatInput.press('Enter');
    }
    
    // Wait for response to appear
    await page.waitForTimeout(3000);
    
    // Check for response in shadow DOM
    const responseFound = await page.waitForFunction(() => {
      const chatElement = document.querySelector('langflow-chat');
      if (!chatElement) return false;
      
      const shadowRoot = chatElement.shadowRoot;
      if (shadowRoot) {
        const messages = shadowRoot.querySelectorAll('.message, .chat-message, [class*="message"], [class*="response"]');
        return messages.length > 0;
      }
      return false;
    }, { timeout: 30000 }).catch(() => false);
    
    // Also check regular DOM for messages
    const regularDOMResponse = await page.locator('.message, .chat-message, [class*="message"]').count().catch(() => 0);
    
    // Verify response is displayed (either in shadow DOM or regular DOM)
    expect(responseFound || regularDOMResponse > 0).toBe(true);
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

