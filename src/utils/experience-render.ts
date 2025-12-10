import DOMPurify from 'isomorphic-dompurify';

export function renderExperienceDescription(description: string): string {
  // First, convert markdown-like syntax to HTML
  let html = description
    .replace(/\n/g, '<br />')
    .replace(/\* /g, '• ')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-link-hover">$1</a>'
    )
    .replace(/<details>/g, '<details class="my-2">')
    .replace(
      /<summary>/g,
      '<summary class="cursor-pointer font-medium text-link-hover">'
    )
    .replace(/<ul>/g, '<ul class="list-disc list-inside ml-4 mt-2">')
    .replace(/<li>/g, '<li class="mb-1">');

  // Sanitize the HTML to prevent XSS attacks
  // Allow common HTML tags and attributes used in experience descriptions
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['br', 'a', 'details', 'summary', 'ul', 'li', 'strong', 'em', 'p'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

