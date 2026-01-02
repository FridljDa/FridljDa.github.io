/**
 * Calculates the estimated reading time for markdown content.
 * Uses the standard reading speed of 200 words per minute.
 * 
 * @param markdown - The markdown content to analyze
 * @returns The reading time in minutes (minimum 1 minute)
 */
export function calculateReadingTime(markdown: string): number {
  if (!markdown || markdown.trim().length === 0) {
    return 1;
  }

  // Strip markdown syntax to get plain text
  let text = markdown;

  // Remove code blocks (```code```)
  text = text.replace(/```[\s\S]*?```/g, '');

  // Remove inline code (`code`)
  text = text.replace(/`[^`]*`/g, '');

  // Remove images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^\)]*\)/g, '');

  // Remove links but keep the text [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  // Remove headers (# ## ###)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove horizontal rules (---)
  text = text.replace(/^---+$/gm, '');

  // Remove blockquotes (>)
  text = text.replace(/^>\s+/gm, '');

  // Remove list markers (- * + 1. 2.)
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove bold/italic markers (**text** *text*)
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // Remove strikethrough (~~text~~)
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // Remove HTML tag delimiters to avoid counting them as words
  text = text.replace(/[<>]/g, ' ');

  // Extra safety: strip any residual "<script" sequences
  text = text.replace(/<\s*script/gi, ' script');

  // Remove extra whitespace and normalize
  text = text.replace(/\s+/g, ' ').trim();

  // Count words (split by whitespace and filter empty strings)
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time: words / 200, rounded up, minimum 1 minute
  const minutes = Math.max(1, Math.ceil(wordCount / 200));

  return minutes;
}

/**
 * Formats reading time as a string.
 * 
 * @param minutes - The reading time in minutes
 * @returns Formatted string like "5 min" or "17 min"
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min`;
}

