---
title: "Building My Personal Website: Technical Highlights"
pubDate: 2025-01-27
updatedDate: 2025-01-27
tags:
  - Web Development
  - Astro
  - AI
  - Automation
description: "A deep dive into the technical implementation of my personal website, covering the AI chat interface, markdown context generation, and automated CV PDF generation workflow."
---

This website is built with [Astro](https://astro.build/) using server-side rendering (SSR), styled with Tailwind CSS, and features an AI chat interface powered by Google's Gemini API. The source code is available on [GitHub](https://github.com/FridljDa/FridljDa.github.io).

In this post, I'll walk through three interesting technical features I implemented:

1. **AI Chat Interface** - A streaming chat interface that provides context-aware responses about my background and blog posts
2. **Context Generation & "View as Markdown"** - A unified system that generates markdown representations of pages for both AI context and user viewing
3. **Automated CV PDF Generation** - A GitHub Actions workflow that automatically generates a PDF resume from a YAML source file

## 1. AI Chat Interface Implementation

The chat interface is one of the most interactive features of the site. It allows visitors to ask questions about my experience, skills, publications, and blog posts, with responses powered by Google's Gemini API.

### Architecture Overview

The chat system consists of two main parts:

- **Client-side React component** (`src/components/Chat.tsx`) - Handles UI, user input, and streaming response display
- **Server-side API route** (`src/pages/api/chat.ts`) - Processes requests, generates context, and streams responses from Gemini

### Streaming Responses

One of the key features is streaming responses, which provides a more responsive user experience. The client uses the `ReadableStream` API to process chunks as they arrive from the server:

```52:107:src/components/Chat.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
      
    // Optimistic UI update: Show user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Network error');
      if (!response.body) throw new Error('No readable body');

      // Initialize Stream Reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = '';

      // Add placeholder for AI response
      setMessages((prev) => [...prev, { role: 'ai', content: '' }]);

      // Read Loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });
        aiResponseText += chunk;

        // Update the last message (AI's message) with accumulated text
        setMessages((prev) => {
          const newHistory = [...prev];
          const lastMsg = newHistory[newHistory.length - 1];
          if (lastMsg.role === 'ai') {
            lastMsg.content = aiResponseText;
          }
          return newHistory;
        });
      }

    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };
```

The client creates a `ReadableStream` reader, decodes each chunk using `TextDecoder`, and updates the UI incrementally as text arrives. This creates a smooth, ChatGPT-like experience where responses appear word-by-word.

### Server-Side Streaming with Gemini

On the server, the API route constructs a comprehensive context from the website content and streams the response from Gemini:

```105:137:src/pages/api/chat.ts
    // 6. Generate Streaming Response
    const result = await chat.sendMessageStream(lastUserMessage);

    // 7. Create ReadableStream for HTTP Response
    // This allows the browser to receive data chunks as they arrive.
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (err) {
          // Log full error details on server for debugging
          const errorMessage = err instanceof Error ? err.message : String(err);
          const errorStack = err instanceof Error ? err.stack : undefined;
          console.error('Stream Error:', err);
          console.error('Stream error details:', { errorMessage, errorStack });
          
          // Close stream gracefully without exposing error details to client
          try {
            controller.close();
          } catch (closeErr) {
            // Log errors during close
            console.error('Error closing stream:', closeErr);
          }
        }
      },
    });

    // 8. Return Response with Correct Headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked', // Indicates streaming
        'X-Content-Type-Options': 'nosniff',
      },
    });
```

The server uses Gemini's `sendMessageStream()` method, which returns an async iterable. Each chunk is encoded and enqueued to the `ReadableStream`, which the client consumes in real-time.

### Context Injection

The chat system is context-aware, meaning it has access to all the content on the website. The context is generated from two sources:

1. **Home page content** - Biography, experience, publications, and blog post summaries
2. **Full blog post content** - Complete markdown from all blog posts

```40:79:src/pages/api/chat.ts
    // 4. Gather all markdown content for context
    const blogPosts = await getCollection('blog');
    const homePageMarkdown = generateHomePageMarkdown(blogPosts);
    
    // Get markdown content from all blog posts
    const blogPostsMarkdown = await Promise.all(
      blogPosts.map(async (post: CollectionEntry<'blog'>) => {
        try {
          const markdown = await getBlogPostRawMarkdown(post);
          return `## Blog Post: ${post.data.title}\n\n${markdown}\n\n---\n\n`;
        } catch (error) {
          console.error(`Error getting markdown for post ${post.id}:`, error);
          return `## Blog Post: ${post.data.title}\n\n*Content not available*\n\n---\n\n`;
        }
      })
    );
    
    const allBlogPostsMarkdown = blogPostsMarkdown.join('\n');

    // 5. Construct System Prompt and History
    // We define the persona and inject all available context (home page content includes CV/resume info, blog posts).
    const systemInstruction = `
      You are a professional AI assistant representing Daniel Fridljand, a Software Consultant with a strong academic background in mathematics, statistics, and bioinformatics.
      Your goal is to answer questions about Daniel's experience, skills, background, publications, and blog posts based *strictly* on the provided content.
        
      tone: Professional, concise, yet approachable.
      rules:  
      - Keep answers concise: 2-3 sentences maximum. Do not reproduce large sections of content verbatim.
      - If the answer is not in the provided content, explicitly state: "I don't see that information in the available content."
      - Do not hallucinate or invent experiences.
      - You have access to:
        1. Home page content (biography, experience, publications, CV/resume information, blog post summaries)
        2. Full blog post content
        
      === HOME PAGE CONTENT (includes CV/Resume information) ===
      ${homePageMarkdown}
      
      === BLOG POSTS (FULL CONTENT) ===
      ${allBlogPostsMarkdown}
    `;
```

This context is injected as a system instruction when starting the chat session, ensuring the AI has access to all relevant information while maintaining strict boundaries to prevent hallucination.

### Mobile-Responsive Design

The chat component automatically minimizes on mobile devices (screens smaller than 768px) and can be toggled between minimized and expanded states:

```16:35:src/components/Chat.tsx
  // Detect mobile on initial load and set minimized by default
  useEffect(() => {
    const checkMobile = () => {
      // Tailwind's md breakpoint is 768px
      if (window.innerWidth < 768) {
        setIsMinimized(true);
      }
    };
    
    checkMobile();
    
    // Optional: handle window resize to maintain state
    const handleResize = () => {
      // Only auto-minimize on mobile if user hasn't manually expanded
      // For now, we'll keep it simple and only set on initial load
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
```

When minimized, it appears as a floating button in the bottom-right corner, expanding to a full chat interface when clicked.

## 2. Context Generation & "View as Markdown" Feature

A key design decision was to create a unified system for generating markdown representations of pages. This serves two purposes:

1. **AI Context** - Provides structured markdown content to the chat system
2. **User Viewing** - Allows users to view any page as markdown via "View as Markdown" buttons

### Markdown Generation Utilities

The core markdown generation logic lives in `src/utils/markdown-generator.ts`. This file contains functions to convert different data structures into markdown:

- `biographyToMarkdown()` - Converts biography data to markdown
- `experienceToMarkdown()` - Converts experience entries to markdown
- `publicationsToMarkdown()` - Converts publications to markdown
- `blogPostToMarkdownSummary()` - Creates summaries of blog posts
- `generateHomePageMarkdown()` - Combines all sections into a single document
- `getBlogPostRawMarkdown()` - Reads and reconstructs full blog post markdown

The `generateHomePageMarkdown()` function combines all home page content:

```121:142:src/utils/markdown-generator.ts
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
```

For blog posts, `getBlogPostRawMarkdown()` reads the original MDX file and reconstructs it with frontmatter:

```149:204:src/utils/markdown-generator.ts
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
    post.data.tags.forEach((tag: string) => {
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
```

This function reads the original MDX file from the filesystem, extracts the content after the frontmatter, and reconstructs a complete markdown document with the frontmatter included.

### API Routes for Markdown

Two API routes serve markdown to users:

1. **`/index.md`** - Serves the home page as markdown
2. **`/post/[slug].md`** - Serves individual blog posts as markdown

Both routes use the same utility functions used by the chat system:

```5:19:src/pages/index.md.ts
export const GET: APIRoute = async () => {
  try {
    const blogPosts = await getCollection('blog');
    const markdown = generateHomePageMarkdown(blogPosts);
    
    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating home page markdown:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
```

```5:29:src/pages/post/[slug].md.ts
export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response('Not Found', { status: 404 });
  }

  const blogPosts = await getCollection('blog');
  const post = blogPosts.find((p: CollectionEntry<'blog'>) => p.id === slug);

  if (!post) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const markdown = await getBlogPostRawMarkdown(post);
    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating markdown for post:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
```

### ViewAsMarkdown Component

The "View as Markdown" buttons are implemented as a simple React component that links to these API routes:

```9:35:src/components/ViewAsMarkdown.tsx
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
```

This component is used in the Biography section and on blog post pages, providing a simple way for users to access the markdown version of any page.

### Benefits of This Approach

This unified approach has several benefits:

1. **DRY Principle** - The same functions generate markdown for both AI context and user viewing
2. **Consistency** - The markdown format is consistent across all uses
3. **Maintainability** - Changes to markdown generation only need to be made in one place
4. **Transparency** - Users can see exactly what content the AI has access to

## 3. Automated CV PDF Generation Workflow

Managing a resume as a PDF file in version control is problematic: PDFs are binary files that don't diff well, making it hard to track changes and collaborate. Instead, I store my CV as a YAML file and use a GitHub Actions workflow to automatically generate a PDF whenever the YAML changes.

### YAML-Based CV Storage

The CV is stored as `src/data/cv.yaml` using the [RenderCV](https://github.com/sinaatalay/rendercv) format. RenderCV is a Python package that generates beautiful, LaTeX-based CVs from YAML files. The YAML structure includes:

- Personal information (name, location, contact details)
- Professional experience
- Education
- Publications
- Skills
- Design and formatting preferences

Here's a snippet of the structure:

```1:15:src/data/cv.yaml
cv:
  name: Daniel Fridljand
  location: Munich, Germany
  email:
  phone:
  website: https://danielfridljand.de/
  social_networks:
    - network: LinkedIn
      username: daniel-fridljand
    - network: GitHub
      username: FridljDa
  sections:
    summary:
      - "I am a driven data scientist with a strong academic background in mathematics, statistics, and bioinformatics. My passion for machine learning, software development, and coding has led me to work on projects across diverse domains, including public health, genetics, and oncology. With three years of scientific software development experience and a first-author publication in a high-impact journal, I'm committed to leveraging computational skills to solve real-world challenges."
```

The YAML format makes it easy to:
- Track changes in Git (text-based diffs)
- Update content programmatically
- Maintain consistency across different CV versions
- Collaborate with others (if needed)

### GitHub Actions Workflow

The automation happens via a GitHub Actions workflow (`.github/workflows/update-cv.yaml`) that triggers whenever `cv.yaml` is pushed to the `master` branch:

```1:67:.github/workflows/update-cv.yaml
name: Update CV

on:
  push:
    branches:
      - master
    paths:
      - 'src/data/cv.yaml'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update_cv:
    name: Generate and update CV PDF
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v6

      - name: Set up Python
        uses: actions/setup-python@v6
        with:
          python-version: '3.12'

      - name: Install RenderCV
        run: |
          pip install "rendercv[full]"

      - name: Generate PDF from CV
        run: rendercv render src/data/cv.yaml

      - name: Copy PDF to public/uploads folder
        run: |
          mkdir -p public/uploads
          if [ -f "rendercv_output/cv.pdf" ]; then
            cp rendercv_output/cv.pdf public/uploads/resume.pdf
          elif [ -f "rendercv_output/$(basename src/data/cv.yaml .yaml).pdf" ]; then
            cp "rendercv_output/$(basename src/data/cv.yaml .yaml).pdf" public/uploads/resume.pdf
          else
            # Find the generated PDF file
            PDF_FILE=$(find rendercv_output -name "*.pdf" -type f | head -n 1)
            if [ -n "$PDF_FILE" ]; then
              cp "$PDF_FILE" public/uploads/resume.pdf
            else
              echo "Error: No PDF file found in rendercv_output"
              exit 1
            fi
          fi

      - name: Set Git credentials
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "GitHub Actions [Bot]"

      - name: Commit and push changes
        run: |
          git add public/uploads/resume.pdf
          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            git commit -m "Update CV PDF"
            git push
          fi
```

The workflow:

1. **Checks out the repository** - Gets access to the YAML file
2. **Sets up Python** - RenderCV requires Python 3.12
3. **Installs RenderCV** - Installs the package with all dependencies
4. **Generates PDF** - Runs `rendercv render` to create the PDF
5. **Copies PDF** - Moves the generated PDF to `public/uploads/resume.pdf`
6. **Commits changes** - Automatically commits and pushes the updated PDF

The workflow also supports manual triggering via `workflow_dispatch`, allowing on-demand PDF regeneration.

### Benefits of This Approach

This automated workflow provides several advantages:

1. **Version Control** - CV changes are tracked as text diffs in Git, making it easy to see what changed and when
2. **Automation** - No manual PDF generation steps required
3. **Consistency** - The PDF is always generated from the same source, ensuring consistency
4. **Reproducibility** - Anyone can regenerate the PDF by running the same RenderCV command
5. **Design Flexibility** - RenderCV supports multiple themes and customization options via YAML

The generated PDF is automatically available on the website at `/uploads/resume.pdf`, and the workflow ensures it stays in sync with the YAML source.

## Conclusion

These three features demonstrate different aspects of modern web development:

- **The chat interface** showcases real-time streaming, AI integration, and context-aware systems
- **The markdown generation system** illustrates the DRY principle and unified data transformation
- **The CV workflow** demonstrates automation, version control best practices, and infrastructure-as-code concepts

Together, they create a website that is both functional and maintainable, with clear separation of concerns and automated processes that reduce manual work. The codebase is open source and available on [GitHub](https://github.com/FridljDa/FridljDa.github.io) for anyone interested in exploring the implementation details further.

