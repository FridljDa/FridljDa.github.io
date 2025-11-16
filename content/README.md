# Content Directory

This directory contains content files that are **NOT used by Astro**. 

## Purpose

The files in this directory are used by the **Langflow** service for AI-powered document processing and chat functionality. They are automatically imported into Langflow when the Docker container starts.

## Structure

- `_index.md` - Repository homepage content
- `authors/` - Author information (used by Langflow)
- `publication/` - Publication metadata and citations
- `home/` - Additional content files

## Astro Content Collections

Astro content collections are located in `src/content/` (not this directory). This includes:
- Blog posts: `src/content/blog/`
- Content collection configuration: `src/content.config.ts`

## Langflow Integration

These files are mounted into the Langflow Docker container and automatically uploaded on startup. See `dynamic/langflow-workspace/docker-compose.yml` for the volume mount configuration.

