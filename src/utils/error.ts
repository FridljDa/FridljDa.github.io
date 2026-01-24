/**
 * Checks if an error is a rate limit or quota exhaustion error
 * @param error - The error to check (can be Error object, string, or unknown)
 * @returns true if the error indicates a rate limit/quota issue
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

/**
 * Checks if an error message string indicates a rate limit error
 * Useful for frontend code that receives error messages as strings
 * @param errorMessage - The error message string to check
 * @returns true if the message indicates a rate limit/quota issue
 */
export function isRateLimitErrorMessage(errorMessage: string): boolean {
  if (!errorMessage) return false;
  
  const errorString = errorMessage.toLowerCase();
  const rateLimitIndicators = [
    'quota',
    'rate limit',
    'exhausted',
    'resource_exhausted',
    '429',
  ];

  return rateLimitIndicators.some((indicator) => errorString.includes(indicator));
}
