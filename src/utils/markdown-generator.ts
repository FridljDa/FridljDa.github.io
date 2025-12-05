import { BIOGRAPHY } from '../data/site';
import { EXPERIENCE } from '../data/experience';
import { PUBLICATIONS } from '../data/publications';
import type { CollectionEntry } from 'astro:content';

/**
 * Generates markdown from Biography data
 */
export function biographyToMarkdown(): string {
  let markdown = `# ${BIOGRAPHY.name}\n\n`;
  markdown += `**${BIOGRAPHY.role}** at [${BIOGRAPHY.organization.name}](${BIOGRAPHY.organization.url})\n\n`;
  markdown += `${BIOGRAPHY.bio}\n\n`;
  
  if (BIOGRAPHY.interests.length > 0) {
    markdown += `## Interests\n\n`;
    BIOGRAPHY.interests.forEach(interest => {
      markdown += `- ${interest}\n`;
    });
    markdown += `\n`;
  }
  
  if (BIOGRAPHY.education.length > 0) {
    markdown += `## Education\n\n`;
    BIOGRAPHY.education.forEach(edu => {
      markdown += `- **${edu.course}**, ${edu.year} — ${edu.institution}\n`;
    });
    markdown += `\n`;
  }
  
  if (BIOGRAPHY.social.length > 0) {
    markdown += `## Social Links\n\n`;
    BIOGRAPHY.social.forEach(social => {
      markdown += `- [${social.name}](${social.url})\n`;
    });
    markdown += `\n`;
  }
  
  return markdown;
}

/**
 * Generates markdown from Experience data
 */
export function experienceToMarkdown(): string {
  let markdown = `# Experience\n\n`;
  
  EXPERIENCE.forEach(exp => {
    const startDate = new Date(exp.dateStart).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    const endDate = exp.dateEnd 
      ? new Date(exp.dateEnd).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Present';
    
    markdown += `## ${exp.title}\n\n`;
    markdown += `**${exp.company}** | ${exp.location} | ${startDate} — ${endDate}\n\n`;
    markdown += `${exp.description}\n\n`;
  });
  
  return markdown;
}

/**
 * Generates markdown from Publications data
 */
export function publicationsToMarkdown(): string {
  let markdown = `# Publications\n\n`;
  
  PUBLICATIONS.forEach(pub => {
    markdown += `## ${pub.title}\n\n`;
    if (pub.authors) {
      markdown += `**Authors:** ${pub.authors.join(', ')}\n\n`;
    }
    if (pub.publicationShort) {
      markdown += `**Journal:** ${pub.publicationShort}\n\n`;
    }
    if (pub.date) {
      markdown += `**Date:** ${pub.date}\n\n`;
    }
    if (pub.urlPdf) {
      markdown += `**Publication:** [${pub.urlPdf}](${pub.urlPdf})\n\n`;
    }
    if (pub.urlCode) {
      markdown += `**Code:** [${pub.urlCode}](${pub.urlCode})\n\n`;
    }
    if (pub.urlDataset) {
      markdown += `**Dataset:** [${pub.urlDataset}](${pub.urlDataset})\n\n`;
    }
    if (pub.summary) {
      markdown += `${pub.summary}\n\n`;
    }
  });
  
  return markdown;
}

/**
 * Generates markdown summary from blog post entry
 */
export function blogPostToMarkdownSummary(post: CollectionEntry<'blog'>): string {
  let markdown = `## ${post.data.title}\n\n`;
  if (post.data.description) {
    markdown += `${post.data.description}\n\n`;
  }
  markdown += `**Published:** ${post.data.pubDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}\n\n`;
  if (post.data.tags && post.data.tags.length > 0) {
    markdown += `**Tags:** ${post.data.tags.join(', ')}\n\n`;
  }
  markdown += `**Link:** [View post](/post/${post.id})\n\n`;
  return markdown;
}

/**
 * Combines all sections into a single markdown document for home page
 */
export function generateHomePageMarkdown(blogPosts: CollectionEntry<'blog'>[]): string {
  let markdown = `# Daniel Fridljand - Personal Website\n\n`;
  markdown += `This page contains my professional biography, experience, and blog posts.\n\n`;
  markdown += `---\n\n`;
  markdown += biographyToMarkdown();
  markdown += `---\n\n`;
  markdown += experienceToMarkdown();
  markdown += `---\n\n`;
  markdown += publicationsToMarkdown();
  markdown += `---\n\n`;
  markdown += `# Blog Posts\n\n`;
  
  const sortedPosts = [...blogPosts].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );
  
  sortedPosts.forEach(post => {
    markdown += blogPostToMarkdownSummary(post);
  });
  
  return markdown;
}

/**
 * Reads raw markdown content from a blog post MDX file
 * Note: This function should be called server-side in Astro
 * In Astro 5.x, we can access the raw body through the entry's body property
 */
export async function getBlogPostRawMarkdown(post: CollectionEntry<'blog'>): Promise<string> {
  // In Astro content collections, the body property contains the raw markdown
  // after frontmatter is parsed. We need to reconstruct with frontmatter.
  let markdown = `---\n`;
  markdown += `title: "${post.data.title}"\n`;
  markdown += `pubDate: ${post.data.pubDate.toISOString()}\n`;
  if (post.data.updatedDate) {
    markdown += `updatedDate: ${post.data.updatedDate.toISOString()}\n`;
  }
  if (post.data.tags && post.data.tags.length > 0) {
    markdown += `tags:\n`;
    post.data.tags.forEach(tag => {
      markdown += `  - ${tag}\n`;
    });
  }
  if (post.data.math) {
    markdown += `math: ${post.data.math}\n`;
  }
  if (post.data.image) {
    markdown += `image: ${post.data.image}\n`;
  }
  markdown += `---\n\n`;
  
  // Access the raw body content
  // In Astro 5.x with glob loader, we need to read from file system
  // The post.id is the relative path from the base directory
  const fs = await import('fs/promises');
  const path = await import('path');
  try {
    // post.id is the relative path from src/content/blog (e.g., "mapping-mutational-signatures-to-trees")
    // We need to construct the full file path
    const filePath = path.join(process.cwd(), 'src/content/blog', `${post.id}.md`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    // Extract content after frontmatter (skip the first --- and find the second ---)
    const frontmatterEnd = fileContent.indexOf('---', 3);
    if (frontmatterEnd !== -1) {
      // Get content after the second ---, skip the newline
      const contentStart = frontmatterEnd + 3;
      const content = fileContent.substring(contentStart).trimStart();
      markdown += content;
    } else {
      // No frontmatter found, use entire file
      markdown += fileContent;
    }
  } catch (error) {
    console.error('Error reading blog post file:', error);
    // Fallback: try to construct markdown from available data
    markdown += `# ${post.data.title}\n\n`;
    if (post.data.description) {
      markdown += `${post.data.description}\n\n`;
    }
    markdown += `*Full content not available. Please view the rendered version.*\n`;
  }
  
  return markdown;
}

