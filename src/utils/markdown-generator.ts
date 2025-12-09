import { BIOGRAPHY } from '../data/site';
import { EXPERIENCE } from '../data/experience';
import { PUBLICATIONS } from '../data/publications';
import type { CollectionEntry } from 'astro:content';
import { readBlogPostFile, extractMarkdownContent } from './content-reader';
import { logger } from './logger';

export function biographyToMarkdown(): string {
  const interestsSection =
    BIOGRAPHY.interests.length > 0
      ? `## Interests\n\n${BIOGRAPHY.interests.map((i) => `- ${i}`).join('\n')}\n\n`
      : '';

  const educationSection =
    BIOGRAPHY.education.length > 0
      ? `## Education\n\n${BIOGRAPHY.education
          .map((edu) => `- **${edu.course}**, ${edu.year} — ${edu.institution}`)
          .join('\n')}\n\n`
      : '';

  const socialSection =
    BIOGRAPHY.social.length > 0
      ? `## Social Links\n\n${BIOGRAPHY.social
          .map((s) => `- [${s.name}](${s.url})`)
          .join('\n')}\n\n`
      : '';

  return `# ${BIOGRAPHY.name}

**${BIOGRAPHY.role}** at [${BIOGRAPHY.organization.name}](${BIOGRAPHY.organization.url})

${BIOGRAPHY.bio}

${interestsSection}${educationSection}${socialSection}`;
}

export function experienceToMarkdown(): string {
  const experiences = EXPERIENCE.map((exp) => {
    const startDate = new Date(exp.dateStart).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    const endDate = exp.dateEnd
      ? new Date(exp.dateEnd).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })
      : 'Present';

    return `## ${exp.title}

**${exp.company}** | ${exp.location} | ${startDate} — ${endDate}

${exp.description}`;
  });

  return `# Experience

${experiences.join('\n\n')}`;
}

export function publicationsToMarkdown(): string {
  const publications = PUBLICATIONS.map((pub) => {
    const parts: string[] = [`## ${pub.title}`];

    if (pub.authors) {
      parts.push(`**Authors:** ${pub.authors.join(', ')}`);
    }
    if (pub.publicationShort) {
      parts.push(`**Journal:** ${pub.publicationShort}`);
    }
    if (pub.date) {
      parts.push(`**Date:** ${pub.date}`);
    }
    if (pub.urlPdf) {
      parts.push(`**Publication:** [${pub.urlPdf}](${pub.urlPdf})`);
    }
    if (pub.urlCode) {
      parts.push(`**Code:** [${pub.urlCode}](${pub.urlCode})`);
    }
    if (pub.urlDataset) {
      parts.push(`**Dataset:** [${pub.urlDataset}](${pub.urlDataset})`);
    }
    if (pub.summary) {
      parts.push(pub.summary);
    }

    return parts.join('\n\n');
  });

  return `# Publications

${publications.join('\n\n')}`;
}

export function blogPostToMarkdownSummary(
  post: CollectionEntry<'blog'>
): string {
  const description = post.data.description
    ? `${post.data.description}\n\n`
    : '';
  const publishedDate = post.data.pubDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const tags =
    post.data.tags && post.data.tags.length > 0
      ? `**Tags:** ${post.data.tags.join(', ')}\n\n`
      : '';

  return `## ${post.data.title}

${description}**Published:** ${publishedDate}

${tags}**Link:** [View post](/post/${post.id})`;
}

export function generateHomePageMarkdown(
  blogPosts: CollectionEntry<'blog'>[]
): string {
  const sortedPosts = [...blogPosts].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  const blogPostsSection = sortedPosts
    .map((post) => blogPostToMarkdownSummary(post))
    .join('\n\n');

  return `# Daniel Fridljand - Personal Website

This page contains my professional biography, experience, and blog posts.

---

${biographyToMarkdown()}
---

${experienceToMarkdown()}
---

${publicationsToMarkdown()}
---

# Blog Posts

${blogPostsSection}`;
}

export async function getBlogPostRawMarkdown(
  post: CollectionEntry<'blog'>
): Promise<string> {
  const frontmatterParts: string[] = [
    `title: "${post.data.title}"`,
    `pubDate: ${post.data.pubDate.toISOString()}`,
  ];

  if (post.data.updatedDate) {
    frontmatterParts.push(
      `updatedDate: ${post.data.updatedDate.toISOString()}`
    );
  }

  if (post.data.tags && post.data.tags.length > 0) {
    frontmatterParts.push(
      `tags:\n${post.data.tags.map((tag: string) => `  - ${tag}`).join('\n')}`
    );
  }

  if (post.data.math) {
    frontmatterParts.push(`math: ${post.data.math}`);
  }

  if (post.data.image) {
    frontmatterParts.push(`image: ${post.data.image}`);
  }

  const frontmatter = `---\n${frontmatterParts.join('\n')}\n---\n\n`;

  try {
    const fileContent = await readBlogPostFile(post.id);
    const content = extractMarkdownContent(fileContent);
    return frontmatter + content;
  } catch (error) {
    logger.error('Error reading blog post file:', error);
    const description = post.data.description
      ? `${post.data.description}\n\n`
      : '';
    return `${frontmatter}# ${post.data.title}

${description}*Full content not available. Please view the rendered version.*`;
  }
}

