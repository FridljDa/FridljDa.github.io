import type { PromptQuota } from '../types/api';

// Shared by the chat API and the chat widget, so keep this free of Node imports.
const HEADERS = {
  limit: 'X-Prompt-Limit',
  remaining: 'X-Prompt-Remaining',
  reset: 'X-Prompt-Reset',
} as const;

export function setPromptQuotaHeaders(headers: Headers, quota: PromptQuota) {
  headers.set(HEADERS.limit, String(quota.limit));
  headers.set(HEADERS.remaining, String(quota.remaining));
  headers.set(HEADERS.reset, quota.resetsAt);
}

export function readPromptQuotaHeaders(headers: Headers): PromptQuota | null {
  const limit = Number(headers.get(HEADERS.limit));
  const remaining = Number(headers.get(HEADERS.remaining));
  const resetsAt = headers.get(HEADERS.reset);
  if (!headers.has(HEADERS.limit) || !Number.isFinite(limit) || !Number.isFinite(remaining) || !resetsAt) {
    return null;
  }
  return { limit, used: limit - remaining, remaining, resetsAt };
}
