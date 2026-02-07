import React, { useState, useEffect, useMemo } from 'react';
import { formatDateWithDay } from '../utils/date';
import { formatReadingTime } from '../utils/reading-time';
import { METADATA_SEPARATOR } from '../utils/constants';

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
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      post.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Read initial tags from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tags = params.get('tags');
      if (tags) {
        setSelectedTags(new Set(tags.split(',')));
      }
    }
  }, []);

  // Update URL when tags change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (selectedTags.size > 0) {
        url.searchParams.set('tags', Array.from(selectedTags).join(','));
      } else {
        url.searchParams.delete('tags');
      }
      // Update URL without reload
      window.history.pushState({}, '', url.toString());
    }
  }, [selectedTags]);

  // Filter posts based on selected tags (OR logic)
  const filteredPosts = useMemo(() => {
    if (selectedTags.size === 0) {
      return posts;
    }
    return posts.filter((post) => 
      post.tags?.some((tag) => selectedTags.has(tag))
    );
  }, [posts, selectedTags]);

  const handleTagClick = (e: React.MouseEvent<HTMLButtonElement>, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTags((prev) => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  };

  const handleClearFilter = () => {
    setSelectedTags(new Set());
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-heading text-mobile-center">Posts</h2>
          {selectedTags.size > 0 && (
            <button
              onClick={handleClearFilter}
              className="px-3 py-1 text-xs bg-surface-elevated hover:bg-surface-alt rounded text-muted hover:text-heading transition-colors"
              aria-label="Clear all filters"
              data-testid="clear-filters"
            >
              Clear all
            </button>
          )}
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap" data-testid="tag-filters">
            <span className="text-sm text-muted">Filter by tag:</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => handleTagClick(e, tag)}
                className={`px-3 py-1 text-sm rounded transition-colors cursor-pointer ${
                  selectedTags.has(tag)
                    ? 'bg-link text-white'
                    : 'bg-surface-elevated hover:bg-surface-alt text-muted hover:text-heading'
                }`}
                aria-label={`Filter by ${tag}`}
                data-testid={`tag-filter-${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted mb-2">No posts found with selected tags</p>
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
              selectedTags={selectedTags}
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
  selectedTags: Set<string>;
}

function BlogPostCard({ post, onTagClick, selectedTags }: BlogPostCardProps) {
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
                selectedTags.has(tag)
                  ? 'bg-link text-white'
                  : 'bg-surface-elevated hover:bg-surface-alt'
              }`}
              aria-label={`Filter by ${tag}`}
              data-testid={`post-tag-${tag}`}
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
                <span className="mx-2">{METADATA_SEPARATOR}</span>
                <span className="inline-flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Reading time indicator"
                    role="img"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatReadingTime(post.readingTime)}
                </span>
              </>
            )}
          </div>
        </a>
      </div>
    </div>
  );
}

