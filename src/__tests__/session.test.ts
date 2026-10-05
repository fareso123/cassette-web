import { describe, test, expect } from 'bun:test';

const { createSessionToken, trackRateLimit } = require('@/lib/session');

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
