import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from './env';

let redis: Redis | null = null;

/**
 * Limiters are cached per budget. Upstash builds the sliding window when the
 * Ratelimit is constructed, so a single shared instance cannot serve both
 * the anonymous and the signed-in quota.
 */
const limiters = new Map<string, Ratelimit>();

function budgetKey(windowMs: number, max: number): string {
  return `${max}:${windowMs}`;
}

function getRedis(): Redis | null {
  if (redis) return redis;
  if (!env.UPSTASH_REDIS_URL || !env.UPSTASH_REDIS_TOKEN) return null;
  redis = new Redis({
    url: env.UPSTASH_REDIS_URL,
    token: env.UPSTASH_REDIS_TOKEN,
  });
  return redis;
}

function getRatelimit(windowMs: number, max: number): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;

  const key = budgetKey(windowMs, max);
  const cached = limiters.get(key);
  if (cached) return cached;

  const limiter = new Ratelimit({
    limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
    analytics: true,
    // Include the budget in the prefix so the two windows do not share
    // counters, and bump it if the quota changes.
    prefix: `cassette-web:${key}`,
    redis: client,
  });

  limiters.set(key, limiter);
  return limiter;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function allowAll(windowMs: number, max: number): RateLimitResult {
  return {
    success: true,
    limit: max,
    remaining: max,
    reset: Date.now() + windowMs,
  };
}

/**
 * Check a caller's budget.
 *
 * Fails open. If Upstash is unreachable the request is allowed through,
 * because returning 500 on every search while Redis is down is worse than
 * briefly losing the limit. The route-level budget is a guard against
 * abuse, not an authorisation control.
 */
export async function checkRateLimit(
  identifier: string,
  windowMs: number = 60000,
  max: number = 100
): Promise<RateLimitResult> {
  const rl = getRatelimit(windowMs, max);
  if (!rl) return allowAll(windowMs, max);

  try {
    const result = await rl.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limit check failed, allowing request:', error);
    return allowAll(windowMs, max);
  }
}

export function rateLimitMiddleware(
  options: { windowMs?: number; max?: number } = {}
): (identifier: string) => Promise<RateLimitResult> {
  const { windowMs = 60000, max = 100 } = options;
  return async (identifier: string) =>
    checkRateLimit(identifier, windowMs, max);
}
