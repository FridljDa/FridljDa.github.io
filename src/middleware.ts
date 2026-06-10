import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!response.headers.has('Cache-Control')) {
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  return response;
});
