// src/middleware.ts
import type { MiddlewareHandler } from 'astro';

// File extensions that should be cached (static assets)
const CACHEABLE_EXTENSIONS = [
  // Images
  '.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp', '.ico',
  // Documents
  '.pdf',
  // Fonts
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  // CSS and JS (if served as static files)
  '.css', '.js',
];

// Paths that should never be cached (dynamic content)
const NON_CACHEABLE_PATHS = [
  '/api/',  // All API routes
];

/**
 * Determines if a request path represents a static asset
 */
function isStaticAsset(pathname: string): boolean {
  // Check if path matches any cacheable file extension
  const hasCacheableExtension = CACHEABLE_EXTENSIONS.some(ext => 
    pathname.toLowerCase().endsWith(ext)
  );
  
  // Check if path is in public directory (images, uploads, etc.)
  const isPublicAsset = pathname.startsWith('/images/') || 
                       pathname.startsWith('/uploads/');
  
  return hasCacheableExtension || isPublicAsset;
}

/**
 * Determines if a request path should not be cached
 */
function isNonCacheable(pathname: string): boolean {
  return NON_CACHEABLE_PATHS.some(path => pathname.startsWith(path));
}

/**
 * Middleware to add Cache-Control headers for edge caching
 * Prepares the application for Render edge caching when upgrading to paid plan
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url } = context;
  const pathname = url.pathname;
  
  // Get the response from the next middleware/handler
  const response = await next();
  
  // Clone the response to modify headers
  const newResponse = response.clone();
  
  // Determine cache strategy based on path
  if (isNonCacheable(pathname)) {
    // Dynamic content: API routes, health checks, etc.
    newResponse.headers.set('Cache-Control', 'no-cache');
  } else if (isStaticAsset(pathname)) {
    // Static assets: images, PDFs, fonts, etc.
    // Cache for 1 year (31536000 seconds)
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000');
  } else {
    // SSR pages and other dynamic content
    // Don't cache to ensure fresh content
    newResponse.headers.set('Cache-Control', 'no-cache');
  }
  
  return newResponse;
};

