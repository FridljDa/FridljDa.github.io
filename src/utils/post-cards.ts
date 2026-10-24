import { getCollection, type CollectionEntry } from 'astro:content';
import type { BlogPost } from '../components/BlogPostsSection';
import { calculateReadingTime } from './reading-time';
import { readBlogPostFile, extractMarkdownContent } from './content-reader';

/** How many of the newest posts the home page shows. */
export const RECENT_POSTS = 5;
/** How many posts one page of /posts shows. */
export const POSTS_PER_PAGE = 50;

/** Every blog post as a card, newest first. */
export async function getPostCards(): Promise<BlogPost[]> {
  const blogPosts = (await getCollection('blog')).sort(
    (a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );
  return Promise.all(
    blogPosts.map(async (post: CollectionEntry<'blog'>) => {
      let readingTime: number | undefined;
      try {
        readingTime = calculateReadingTime(extractMarkdownContent(await readBlogPostFile(post.id)));
      } catch {
        // If we can't read the file, skip reading time
      }
      return {
        id: post.id,
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate.toISOString(),
        slug: post.id,
        image: post.data.image,
        tags: post.data.tags,
        readingTime,
      };
    })
  );
}

/** The URL of page `n` (1-based) of the post list. */
export function postsPageUrl(n: number): string {
  return n === 1 ? '/posts' : `/posts/${n}`;
}
