import matter from 'gray-matter';

export async function readBlogPostFile(postId: string): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const filePath = path.join(process.cwd(), 'src/content/blog', `${postId}.md`);
  return await fs.readFile(filePath, 'utf-8');
}

export function extractMarkdownContent(fileContent: string): string {
  const parsed = matter(fileContent);
  return parsed.content.trimStart();
}

