import { describe, test, expect } from 'bun:test';
import {
  users,
  rateLimitTable,
  scrapers,
  searchHistory,
} from '@/lib/db/schema';

describe('Security database schema', () => {
  test('should have rate_limit table for API protection', () => {
    expect(rateLimitTable.identifier).toBeDefined();
    expect(rateLimitTable.endpoint).toBeDefined();
    expect(rateLimitTable.count).toBeDefined();
    expect(rateLimitTable.window).toBeDefined();
  });

  test('should have users table with failed_login_attempts and lockout_until', () => {
    expect(users.failedLoginAttempts).toBeDefined();
    expect(users.lockoutUntil).toBeDefined();
    expect(users.lastLoginAttempt).toBeDefined();
  });

  test('should have scrapers table with enabled and rate_limit_ms', () => {
    expect(scrapers.enabled).toBeDefined();
    expect(scrapers.rateLimitMs).toBeDefined();
    expect(scrapers.selectorsJson).toBeDefined();
  });

  test('should have search_history table with user_id and query', () => {
    expect(searchHistory.userId).toBeDefined();
    expect(searchHistory.query).toBeDefined();
    expect(searchHistory.queryType).toBeDefined();
  });
});
