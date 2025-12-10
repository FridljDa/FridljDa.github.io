import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCollection, type CollectionEntry } from 'astro:content';
import { generateHomePageMarkdown, getBlogPostRawMarkdown } from '../../utils/markdown-generator';
import { logger } from '../../utils/logger';
import { getEnvVar } from '../../utils/env';
import {
  validateContentType,
  parseChatRequest,
  createErrorResponse,
} from '../../utils/validation';
import type { ChatMessage, GeminiHistoryMessage } from '../../types/api';

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!validateContentType(request)) {
      return createErrorResponse('Invalid Content-Type');
    }

    const body = await request.json();
    const parseResult = parseChatRequest(body);
    if (!parseResult.success) {
      return createErrorResponse(
        'Invalid message format',
        parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      );
    }
    const validatedBody = parseResult.data;

    const apiKey = getEnvVar('GEMINI_API_KEY');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const blogPosts = await getCollection('blog');
    const homePageMarkdown = generateHomePageMarkdown(blogPosts);

    const blogPostsMarkdown = await Promise.all(
      blogPosts.map(async (post: CollectionEntry<'blog'>) => {
        try {
          const markdown = await getBlogPostRawMarkdown(post);
          return `## Blog Post: ${post.data.title}\n\n${markdown}\n\n---\n\n`;
        } catch (error) {
          logger.error(`Error getting markdown for post ${post.id}:`, error);
          return `## Blog Post: ${post.data.title}\n\n*Content not available*\n\n---\n\n`;
        }
      })
    );

    const allBlogPostsMarkdown = blogPostsMarkdown.join('\n');

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

    const history: GeminiHistoryMessage[] = validatedBody.messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemInstruction }],
        },
        {
          role: 'model',
          parts: [
            {
              text: "I have reviewed Daniel's home page content (including CV/resume information) and blog posts. I'm ready to answer questions about his experience, skills, background, publications, and blog content.",
            },
          ],
        },
        ...history,
      ],
    });

    const lastUserMessage = validatedBody.messages[validatedBody.messages.length - 1].content;
    const result = await chat.sendMessageStream(lastUserMessage);

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
          logger.error('Stream error:', err instanceof Error ? err.message : String(err));
          try {
            controller.close();
          } catch (closeErr) {
            logger.error('Error closing stream:', closeErr);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    logger.error(
      'Chat endpoint error:',
      error instanceof Error ? error.message : String(error)
    );
    return createErrorResponse('Internal Server Error', undefined, 500);
  }
};

