export async function readBlogPostFile(postId: string): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const filePath = path.join(process.cwd(), 'src/content/blog', `${postId}.md`);
  return await fs.readFile(filePath, 'utf-8');
}

export function extractMarkdownContent(fileContent: string): string {
  const frontmatterEnd = fileContent.indexOf('---', 3);
  if (frontmatterEnd !== -1) {
    const contentStart = frontmatterEnd + 3;
    return fileContent.substring(contentStart).trimStart();
  }
  return fileContent;
}

