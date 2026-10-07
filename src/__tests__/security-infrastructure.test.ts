import { describe, test, expect } from 'bun:test';

describe('Security infrastructure', () => {
  test('should initialize Cloudflare Turnstile config', async () => {
    const { verifyToken } = await import('@/lib/turnstile');
    expect(verifyToken).toBeDefined();
    expect(typeof verifyToken).toBe('function');
  });

  test('should create rate limit middleware for API routes', async () => {
    const { rateLimitMiddleware } = await import('@/lib/rate-limit');
    expect(rateLimitMiddleware).toBeDefined();
    expect(typeof rateLimitMiddleware).toBe('function');
  });

  test('should add security headers middleware', async () => {
    const { securityMiddleware } = await import('@/lib/security-middleware');
    expect(securityMiddleware).toBeDefined();
  });
});
