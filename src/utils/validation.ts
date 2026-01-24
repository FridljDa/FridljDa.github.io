import { z } from 'zod';
import type { ChatRequest } from '../types/api';

export function validateContentType(request: Request): boolean {
  return request.headers.get('Content-Type') === 'application/json';
}

// Zod schema for chat message validation
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string(),
});

// Zod schema for chat request validation
const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
});

export function validateChatRequest(body: unknown): body is ChatRequest {
  const result = ChatRequestSchema.safeParse(body);
  return result.success;
}

export function parseChatRequest(body: unknown): { success: true; data: ChatRequest } | { success: false; error: z.ZodError } {
  const result = ChatRequestSchema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function createErrorResponse(
  error: string,
  message?: string,
  status = 400
): Response {
  return new Response(
    JSON.stringify({
      error,
      ...(message && { message }),
    }),
    { status }
  );
}

/**
 * Checks if an error is a rate limit or quota exhaustion error
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // Check for common rate limit indicators
  const rateLimitIndicators = [
    'quota',
    'rate limit',
    'exhausted',
    'resource_exhausted',
    '429',
  ];

  // Check error message
  if (rateLimitIndicators.some((indicator) => errorString.includes(indicator))) {
    return true;
  }

  // Check for HTTP status codes in error objects
  if (typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    const status = errorObj.status || errorObj.statusCode || errorObj.code;
    if (status === 429 || status === '429') {
      return true;
    }
  }

  return false;
}

