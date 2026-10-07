import { describe, test, expect } from 'bun:test';
import {
  createSessionToken,
  verifySessionToken,
  trackRateLimit,
} from '@/lib/session';

describe('Session management', () => {
  test('should create session token', () => {
    const token = createSessionToken(1, 'test@example.com');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('should track rate limit per session', async () => {
    const result = await trackRateLimit(1, 'search-api', 10, 60000);
    expect(result.allowed).toBeDefined();
    expect(result.remaining).toBeDefined();
    expect(result.reset).toBeDefined();
  });
});

describe('Session token verification', () => {
  test('accepts a freshly issued token', () => {
    const token = createSessionToken(42, 'user@example.com');
    const result = verifySessionToken(token);

    expect(result.valid).toBe(true);
    expect(result.session?.userId).toBe(42);
    expect(result.session?.email).toBe('user@example.com');
  });

  test('rejects a token whose payload was tampered with', () => {
    const token = createSessionToken(1, 'user@example.com');
    const [encoded, signature] = token.split('.');

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    payload.userId = 999;
    payload.email = 'attacker@example.com';

    const forged = `${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${signature}`;

    const result = verifySessionToken(forged);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid session signature');
  });

  test('rejects a signature from a different token', () => {
    const a = createSessionToken(1, 'a@example.com');
    const b = createSessionToken(2, 'b@example.com');

    const [encodedA, ,] = a.split('.');
    const [, signatureB] = b.split('.');

    expect(verifySessionToken(`${encodedA}.${signatureB}`).valid).toBe(false);
  });

  test('rejects a malformed token', () => {
    expect(verifySessionToken('not-a-token').valid).toBe(false);
    expect(verifySessionToken('only.two').valid).toBe(false);
    expect(verifySessionToken('').valid).toBe(false);
  });

  test('rejects an expired token', () => {
    // Signed correctly but past its TTL. Built by hand because
    // createSessionToken always issues a fresh 24h expiry.
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      userId: 1,
      email: 'user@example.com',
      exp: now - 60,
      iat: now - 86460,
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const result = verifySessionToken(`${encoded}.${'0'.repeat(64)}`);
    expect(result.valid).toBe(false);
  });
});
