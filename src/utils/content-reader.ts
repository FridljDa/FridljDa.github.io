import matter from 'gray-matter';

export async function readBlogPostFile(postId: string): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  // Try .mdx first, then .md
  const mdxPath = path.join(process.cwd(), 'src/content/blog', `${postId}.mdx`);
  const mdPath = path.join(process.cwd(), 'src/content/blog', `${postId}.md`);
  
  try {
    return await fs.readFile(mdxPath, 'utf-8');
  } catch (error) {
    // If .mdx doesn't exist, try .md
    return await fs.readFile(mdPath, 'utf-8');
  }
}

export function extractMarkdownContent(fileContent: string): string {
  const parsed = matter(fileContent);
  return parsed.content.trimStart();
}

