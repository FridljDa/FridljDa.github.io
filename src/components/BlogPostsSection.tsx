import React, { useState, useEffect, useMemo } from 'react';
import { formatDateWithDay } from '../utils/date';
import { formatReadingTime } from '../utils/reading-time';

export interface BlogPost {
  id: string;
  title: string;
  description?: string;
  pubDate: string; // ISO string
  slug: string;
  image?: string;
  tags?: string[];
  readingTime?: number;
}

interface BlogPostsSectionProps {
  posts: BlogPost[];
}

export default function BlogPostsSection({ posts }: BlogPostsSectionProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Read initial tag from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tag = params.get('tag');
      if (tag) {
        setSelectedTag(tag);
      }
    }
  }, []);

  // Update URL when tag changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (selectedTag) {
        url.searchParams.set('tag', selectedTag);
      } else {
        url.searchParams.delete('tag');
      }
      // Update URL without reload
      window.history.pushState({}, '', url.toString());
    }
  }, [selectedTag]);

  // Filter posts based on selected tag
  const filteredPosts = useMemo(() => {
    if (!selectedTag) {
      return posts;
    }
    return posts.filter((post) => post.tags?.includes(selectedTag));
  }, [posts, selectedTag]);

  const handleTagClick = (e: React.MouseEvent<HTMLButtonElement>, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  const handleClearFilter = () => {
    setSelectedTag(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-heading text-mobile-center">Posts</h2>
        {selectedTag && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              Filtered by: <span className="font-semibold text-heading">{selectedTag}</span>
            </span>
            <button
              onClick={handleClearFilter}
              className="px-3 py-1 text-xs bg-surface-elevated hover:bg-surface-alt rounded text-muted hover:text-heading transition-colors"
              aria-label="Clear filter"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted mb-2">No posts found with tag &quot;{selectedTag}&quot;</p>
          <button
            onClick={handleClearFilter}
            className="text-link hover:underline text-sm"
          >
            Show all posts
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <BlogPostCard
              key={post.id}
              post={post}
              onTagClick={handleTagClick}
              selectedTag={selectedTag}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BlogPostCardProps {
  post: BlogPost;
  onTagClick: (e: React.MouseEvent<HTMLButtonElement>, tag: string) => void;
  selectedTag: string | null;
}

function BlogPostCard({ post, onTagClick, selectedTag }: BlogPostCardProps) {
  return (
    <div className="bg-surface rounded-lg shadow-sm border border-surface hover:shadow-md transition-shadow overflow-hidden group">
      <a href={`/post/${post.slug}`} className="block">
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
      </a>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2 justify-mobile-center flex-wrap">
          {post.tags?.map((tag) => (
            <button
              key={tag}
              onClick={(e) => onTagClick(e, tag)}
              className={`px-2 py-1 text-xs rounded text-muted transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-link text-white'
                  : 'bg-surface-elevated hover:bg-surface-alt'
              }`}
              aria-label={`Filter by ${tag}`}
            >
              {tag}
            </button>
          ))}
        </div>
        <a href={`/post/${post.slug}`} className="block">
          <h3 className="text-xl font-semibold mb-2 text-heading group-hover:text-link transition-colors text-mobile-center">
            {post.title}
          </h3>
          {post.description && (
            <p className="text-muted mb-4 line-clamp-2">{post.description}</p>
          )}
          <div className="text-sm text-subtle text-mobile-center block">
            <time>{formatDateWithDay(post.pubDate)}</time>
            {post.readingTime && (
              <>
                <span className="mx-2">·</span>
                <span>{formatReadingTime(post.readingTime)}</span>
              </>
            )}
          </div>
        </a>
      </div>
    </div>
  );
}

