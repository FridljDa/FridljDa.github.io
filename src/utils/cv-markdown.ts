// CV Markdown Generator
// Converts CV data to markdown format for AI chat context

import cvText from '../data/cv.md?raw';

/**
 * Gets CV content as markdown
 * Uses the existing cv.md file which is manually maintained
 * This provides a stable markdown representation of the CV
 */
export function getCvMarkdown(): string {
  return cvText;
}

/**
 * Alternative: Generate markdown from cv.yaml
 * This is more complex and would require parsing YAML and converting to markdown
 * For now, we use the existing cv.md file which is already in markdown format
 */
export async function generateCvMarkdownFromYaml(): Promise<string> {
  // This would require:
  // 1. Reading cv.yaml
  // 2. Parsing YAML structure
  // 3. Converting to markdown format
  // For simplicity, we use the existing cv.md file
  return getCvMarkdown();
}

