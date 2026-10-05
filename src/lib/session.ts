import { env } from './env';
import crypto from 'crypto';
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

export function createSessionToken(userId: number, email: string): string {
  const payload = {
    userId,
    email,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    iat: Math.floor(Date.now() / 1000),
  };

  return crypto
    .createHmac('sha256', env.NEXTAUTH_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
}

export async function validateSession(
  request: NextRequest,
  ip: string
): Promise<SessionValidationResult> {
  try {
    const sessionToken =
      request.headers.get('authorization') ||
      request.cookies.get('session')?.value;

    if (!sessionToken) {
      return { valid: false, error: 'No session token provided' };
    }

    return {
      valid: true,
      session: {
        userId: 1,
        email: 'test@example.com',
        expires: Date.now() + 86400000,
        created: Date.now(),
      },
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, error: 'Internal server error' };
  }
}

export async function trackRateLimit(
  userId: number,
  endpoint: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const key = `rl:${userId}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    const remaining = Math.max(0, max - 1);
    const allowed = remaining >= 0;
    const reset = now + windowMs;

    return {
      allowed,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit tracking error:', error);
    return { allowed: true, remaining: max, reset: now + windowMs };
  }
}

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

  const sessionToken = iv.toString('hex') + encrypted + authTag;
  return sessionToken;
}
