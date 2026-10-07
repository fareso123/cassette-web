import crypto from 'crypto';
import { and, eq, gte } from 'drizzle-orm';
import { env } from './env';
import { db } from './db';
import { rateLimitTable } from './db/schema';
import type { NextRequest } from 'next/server';

export interface Session {
  userId: number;
  email: string;
  expires: number;
  created: number;
}

export interface SessionValidationResult {
  valid: boolean;
  session?: Session;
  error?: string;
}

const TOKEN_TTL_SECONDS = 24 * 60 * 60;

function sign(payload: string): string {
  return crypto
    .createHmac('sha256', env.NEXTAUTH_SECRET)
    .update(payload)
    .digest('hex');
}

/**
 * Issue an HMAC-signed session token.
 *
 * Format: `<base64url payload>.<hmac hex>`. The payload carries `exp`, and
 * verification checks it, so the token cannot outlive its TTL.
 */
export function createSessionToken(userId: number, email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    userId,
    email,
    exp: now + TOKEN_TTL_SECONDS,
    iat: now,
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

/**
 * Verify a token's signature and expiry.
 *
 * Uses timingSafeEqual so a caller cannot learn the expected digest one
 * character at a time from response timing.
 */
export function verifySessionToken(token: string): SessionValidationResult {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed session token' };
  }

  const [encoded, signature] = parts;

  const expected = sign(encoded);
  const given = Buffer.from(signature, 'hex');
  const want = Buffer.from(expected, 'hex');

  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
    return { valid: false, error: 'Invalid session signature' };
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as { userId: number; email: string; exp: number; iat?: number };

    if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) {
      return { valid: false, error: 'Session expired' };
    }

    return {
      valid: true,
      session: {
        userId: payload.userId,
        email: payload.email,
        expires: payload.exp * 1000,
        created: (payload.iat ?? payload.exp - TOKEN_TTL_SECONDS) * 1000,
      },
    };
  } catch {
    return { valid: false, error: 'Malformed session payload' };
  }
}

/**
 * Resolve the caller from an Authorization header or a `session` cookie.
 *
 * Note: the API route currently does not call this, so there is no
 * authentication in front of /api/search yet. Only rate limiting is
 * applied there. Wire this in before exposing per-user data.
 */
export async function validateSession(
  request: NextRequest,
  _ip: string
): Promise<SessionValidationResult> {
  try {
    const header = request.headers.get('authorization');
    const bearer = header?.startsWith('Bearer ')
      ? header.slice('Bearer '.length)
      : undefined;
    const token = bearer || request.cookies.get('session')?.value;

    if (!token) {
      return { valid: false, error: 'No session token provided' };
    }

    return verifySessionToken(token);
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, error: 'Internal server error' };
  }
}

export interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  reset: number;
}

/**
 * Per-session request counter, backed by the `rate_limit` table.
 *
 * Rejects a request once `max` is reached within the window. A DB failure
 * allows the request through rather than blocking the user, on the
 * assumption that the route-level Upstash limiter is the primary guard.
 */
export async function trackRateLimit(
  userId: number,
  endpoint: string,
  max: number,
  windowMs: number
): Promise<RateLimitCheck> {
  const now = Date.now();
  const windowStart = new Date(now - windowMs);

  try {
    const existing = await db
      .select()
      .from(rateLimitTable)
      .where(
        and(
          eq(rateLimitTable.identifier, String(userId)),
          eq(rateLimitTable.endpoint, endpoint),
          gte(rateLimitTable.createdAt, windowStart)
        )
      );

    const used = existing.reduce((total, row) => total + row.count, 0);

    if (used >= max) {
      return {
        allowed: false,
        remaining: 0,
        reset: windowStart.getTime() + windowMs,
      };
    }

    await db.insert(rateLimitTable).values({
      identifier: String(userId),
      endpoint,
      count: 1,
      window: windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, max - used - 1),
      reset: windowStart.getTime() + windowMs,
    };
  } catch (error) {
    console.error('Rate limit tracking error:', error);
    return { allowed: true, remaining: max, reset: now + windowMs };
  }
}

/**
 * AES-256-GCM encrypted session cookie value.
 *
 * GCM is authenticated, so tampering fails the auth tag check on read.
 */
export function createSessionCookie(session: Session): string {
  const payload = {
    userId: session.userId,
    email: session.email,
    exp: session.expires,
    iat: session.created,
  };

  const secret = Buffer.from(env.NEXTAUTH_SECRET, 'utf8');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', secret, iv);

  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return iv.toString('hex') + encrypted + authTag;
}
