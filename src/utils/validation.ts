import type { ChatRequest } from '../types/api';

export function validateContentType(request: Request): boolean {
  return request.headers.get('Content-Type') === 'application/json';
}

export function validateChatRequest(body: unknown): body is ChatRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const request = body as Record<string, unknown>;

  if (!Array.isArray(request.messages)) {
    return false;
  }

  return request.messages.every((msg) => {
    if (!msg || typeof msg !== 'object') {
      return false;
    }
    const message = msg as Record<string, unknown>;
    return (
      (message.role === 'user' || message.role === 'ai') &&
      typeof message.content === 'string'
    );
  });
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

