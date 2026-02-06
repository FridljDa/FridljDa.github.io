/**
 * Normalize a string for case-insensitive, punctuation-agnostic matching.
 * Used across model-name matching logic in data-fetching scripts.
 */
export function normalizeForMatch(s) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[._]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\d{4}-\d{2}-\d{2}$/, "")
    .trim();
}
