// src/pages/api/check-password.ts
import type { APIRoute } from 'astro';
import { createHash, timingSafeEqual } from 'node:crypto';
import { createErrorResponse } from '../../utils/validation';
import { logger } from '../../utils/logger';

// Hash both sides so timingSafeEqual gets equal-length buffers.
function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

export const POST: APIRoute = async ({ request }) => {
  const secretPassword = import.meta.env.SECRET_PASSWORD;
  if (!secretPassword) {
    logger.error('SECRET_PASSWORD environment variable is not set');
    return createErrorResponse('Configuration error', undefined, 500);
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return createErrorResponse('Invalid JSON');
  }
  if (typeof password !== 'string') {
    return createErrorResponse('Missing password');
  }

  const correct = timingSafeEqual(sha256(password), sha256(secretPassword));
  return new Response(JSON.stringify({ correct }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
