import { createHash, randomBytes } from 'node:crypto';
import type { PromptQuota } from '../types/api';

/**
 * How many chat questions one visitor may ask per day. Keeps a single visitor
 * from spending the whole free Gemini quota that all visitors share.
 */
export const PROMPTS_PER_VISITOR_PER_DAY = 10;

/** Gemini free-tier quotas reset at midnight Pacific time (9:00 in Germany). */
const QUOTA_TIME_ZONE = 'America/Los_Angeles';

// Counts live in memory only: they reset with the day, and also whenever the
// server restarts (e.g. when Render's free tier spins the instance down).
const usageByVisitor = new Map<string, number>();
let usageDay = '';

// Per-process salt so the map never holds raw IP addresses.
const visitorSalt = randomBytes(16).toString('hex');

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

function startDayIfNeeded(now: Date) {
  const today = quotaDay(now);
  if (today !== usageDay) {
    usageByVisitor.clear();
    usageDay = today;
  }
}

function toQuota(used: number, now: Date): PromptQuota {
  return {
    limit: PROMPTS_PER_VISITOR_PER_DAY,
    used,
    remaining: Math.max(0, PROMPTS_PER_VISITOR_PER_DAY - used),
    resetsAt: nextReset(now).toISOString(),
  };
}

/**
 * Identifies a visitor by a salted hash of their IP. Behind Render's proxy the
 * socket address is the proxy, so the first X-Forwarded-For entry is used.
 * The header can be spoofed; the limit is a fairness measure, not security.
 */
export function getVisitorId(request: Request, clientAddress: string | undefined): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwardedFor || clientAddress || 'unknown';
  return createHash('sha256').update(visitorSalt).update(ip).digest('hex');
}

export function getPromptQuota(visitorId: string, now = new Date()): PromptQuota {
  startDayIfNeeded(now);
  return toQuota(usageByVisitor.get(visitorId) ?? 0, now);
}

/**
 * Reserves one prompt for the visitor. Returns the updated quota, or null if
 * the visitor has no prompts left today.
 */
export function consumePrompt(visitorId: string, now = new Date()): PromptQuota | null {
  startDayIfNeeded(now);
  const used = usageByVisitor.get(visitorId) ?? 0;
  if (used >= PROMPTS_PER_VISITOR_PER_DAY) {
    return null;
  }
  usageByVisitor.set(visitorId, used + 1);
  return toQuota(used + 1, now);
}

/** Gives back a reserved prompt when the request failed before answering. */
export function refundPrompt(visitorId: string, now = new Date()) {
  startDayIfNeeded(now);
  const used = usageByVisitor.get(visitorId) ?? 0;
  if (used > 0) {
    usageByVisitor.set(visitorId, used - 1);
  }
}
