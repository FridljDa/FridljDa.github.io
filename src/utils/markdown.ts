// Client-side HTML to Markdown conversion utility
// Uses Turndown library for converting HTML content to markdown format

import TurndownService from 'turndown';

/**
 * Converts HTML content to Markdown format
 * @param htmlContent - The HTML string to convert
 * @returns Markdown formatted string
 */
export function htmlToMarkdown(htmlContent: string): string {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
  });

  // Configure Turndown to preserve links and images
  turndownService.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: (content) => `~~${content}~~`,
  });

  return turndownService.turndown(htmlContent);
}

/**
 * Extracts main content from a page, excluding navigation, footer, and other non-content elements
 * @param element - The DOM element to extract content from (defaults to document.body)
 * @returns HTML string of the main content
 */
export function extractMainContent(element?: HTMLElement): string {
  const container = element || document.body;
  
  // Clone the container to avoid modifying the original
  const clone = container.cloneNode(true) as HTMLElement;
  
  // Remove common non-content elements
  const elementsToRemove = clone.querySelectorAll(
    'nav, header, footer, script, style, .chat-container, [data-exclude-from-markdown]'
  );
  elementsToRemove.forEach((el) => el.remove());
  
  return clone.innerHTML;
}

/**
 * Converts the main content of the current page to Markdown
 * @returns Markdown formatted string of the page content
 */
export function pageToMarkdown(): string {
  const mainContent = extractMainContent();
  return htmlToMarkdown(mainContent);
}

