import type { GeminiQuota } from '../types/api';

/**
 * Models to try in order, with their free-tier requests per day (see
 * Dashboard > Usage in Google AI Studio). When Gemini rejects a model for its
 * daily quota, the limit stated in that error replaces the value here.
 */
export const GEMINI_MODELS = [
  { name: 'gemini-2.5-flash', dailyLimit: 20 },
  { name: 'gemini-3-flash-preview', dailyLimit: 20 },
  { name: 'gemini-2.5-flash-lite', dailyLimit: 20 },
  // Not counted: Gemma's free tier allows 15k input tokens per minute, less
  // than the CV and blog posts sent with every question.
  { name: 'gemma-3-27b', dailyLimit: 0 },
] as const;

/** Gemini's daily quotas reset at midnight Pacific time (9:00 in Germany). */
const QUOTA_TIME_ZONE = 'America/Los_Angeles';

interface ModelUsage {
  dailyLimit: number;
  used: number;
  /** Gemini rejected the model for the rest of the day */
  unavailable: boolean;
}

// Gemini has no API for remaining quota, so we count answers ourselves. The
// counts live in memory: they reset each day and whenever the server
// restarts (Render's free tier spins it down when idle). Gemini's own
// rejections then correct them.
const usageByModel = new Map<string, ModelUsage>(
  GEMINI_MODELS.map((model) => [
    model.name,
    { dailyLimit: model.dailyLimit, used: 0, unavailable: false },
  ])
);
let usageDay = '';

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: QUOTA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const offsetFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: QUOTA_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

/** Calendar day (YYYY-MM-DD) in the quota time zone. */
function quotaDay(now: Date): string {
  return dayFormatter.format(now);
}

/** Offset of the quota time zone from UTC at the given instant, in ms. */
function timeZoneOffsetMs(date: Date): number {
  const parts = offsetFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const wallClockAsUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  );
  return wallClockAsUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The next midnight in the quota time zone. */
function nextReset(now: Date): Date {
  const [year, month, day] = quotaDay(now).split('-').map(Number);
  const nextMidnightUtc = Date.UTC(year, month - 1, day + 1);
  // nextMidnightUtc is the afternoon before in Pacific time, and DST switches
  // at 2:00, so the offset there matches the offset at the target midnight.
  return new Date(nextMidnightUtc - timeZoneOffsetMs(new Date(nextMidnightUtc)));
}

function usageFor(model: string, now: Date): ModelUsage | undefined {
  const today = quotaDay(now);
  if (today !== usageDay) {
    for (const usage of usageByModel.values()) {
      usage.used = 0;
      usage.unavailable = false;
    }
    usageDay = today;
  }
  return usageByModel.get(model);
}

interface QuotaViolation {
  quotaId?: string;
  quotaMetric?: string;
  quotaValue?: string;
}

/** The per-day quota violation in a Gemini 429 error, if there is one. */
function findDailyQuotaViolation(error: unknown): QuotaViolation | undefined {
  const details = (error as { errorDetails?: unknown } | null)?.errorDetails;
  if (!Array.isArray(details)) return undefined;
  for (const detail of details) {
    if (!String(detail?.['@type']).endsWith('google.rpc.QuotaFailure')) continue;
    const violations: QuotaViolation[] = Array.isArray(detail.violations) ? detail.violations : [];
    const daily = violations.find((violation) => violation.quotaId?.includes('PerDay'));
    if (daily) return daily;
  }
  return undefined;
}

export function isModelAvailable(model: string, now = new Date()): boolean {
  return !usageFor(model, now)?.unavailable;
}

export function recordModelSuccess(model: string, now = new Date()) {
  const usage = usageFor(model, now);
  if (usage) usage.used += 1;
}

/** Marks a model as used up for the day when Gemini says so. */
export function recordModelFailure(model: string, error: unknown, now = new Date()) {
  const usage = usageFor(model, now);
  if (!usage) return;

  const dailyViolation = findDailyQuotaViolation(error);
  if (dailyViolation) {
    usage.unavailable = true;
    const limit = Number(dailyViolation.quotaValue);
    if (dailyViolation.quotaMetric?.endsWith('_requests') && Number.isFinite(limit)) {
      usage.dailyLimit = limit;
    }
  } else if ((error as { status?: number } | null)?.status === 404) {
    usage.unavailable = true;
  }
}

export function getGeminiQuota(now = new Date()): GeminiQuota {
  let remaining = 0;
  let exhausted = true;
  for (const model of GEMINI_MODELS) {
    const usage = usageFor(model.name, now);
    if (!usage || usage.unavailable) continue;
    exhausted = false;
    remaining += Math.max(0, usage.dailyLimit - usage.used);
  }
  return { remaining, exhausted, resetsAt: nextReset(now).toISOString() };
}
