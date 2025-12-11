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

export type ParseChatRequestResult =
  | { success: true; data: ChatRequest }
  | { success: false; error: z.ZodError };

export function parseChatRequest(body: unknown): ParseChatRequestResult {
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

