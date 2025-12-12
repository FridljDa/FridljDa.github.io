import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

// Configure marked for synchronous parsing
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
});

export function renderExperienceDescription(description: string): string {
  // Parse markdown to HTML using marked (synchronous)
  let html = marked(description) as string;

  // Add Tailwind classes to specific HTML elements
  html = html
    .replace(/<details>/g, '<details class="my-2">')
    .replace(
      /<summary>/g,
      '<summary class="cursor-pointer font-medium text-link-hover">'
    )
    .replace(/<ul>/g, '<ul class="list-disc list-inside ml-4 mt-2">')
    .replace(/<li>/g, '<li class="mb-1">')
    .replace(
      /<a href="([^"]+)">/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-link-hover">'
    );

  // Sanitize the HTML to prevent XSS attacks
  // Allow common HTML tags and attributes used in experience descriptions
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['br', 'a', 'details', 'summary', 'ul', 'li', 'strong', 'em', 'p'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

