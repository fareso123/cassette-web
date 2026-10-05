import { Ratelimit } from '@upstash/ratelimit';
import { env } from './env';

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;
  if (!env.UPSTASH_REDIS_URL) return null;
  ratelimit = new Ratelimit({
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    analytics: true,
    prefix: 'cassette-web',
  });
  return ratelimit;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  identifier: string,
  windowMs: number = 60000,
  max: number = 100
): Promise<RateLimitResult> {
  const rl = getRatelimit();
  if (!rl) {
    return {
      success: true,
      limit: max,
      remaining: max,
      reset: Date.now() + windowMs,
    };
  }

  const result = await rl.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function rateLimitMiddleware(
  options: { windowMs?: number; max?: number } = {}
): (identifier: string) => Promise<RateLimitResult> {
  const { windowMs = 60000, max = 100 } = options;
  return async (identifier: string) =>
    checkRateLimit(identifier, windowMs, max);
}
