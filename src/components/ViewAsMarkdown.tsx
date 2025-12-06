import React from 'react';

interface ViewAsMarkdownProps {
  href: string;
  label?: string;
  markdown?: string; // Kept for backward compatibility but not used
}

export default function ViewAsMarkdown({ href, label = 'View as Markdown' }: ViewAsMarkdownProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-surface border border-surface rounded-lg text-sm text-heading transition-colors"
      aria-label={label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      {label}
    </a>
  );
}

