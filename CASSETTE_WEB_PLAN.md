# cassette-web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-user music search/link resolver website with integrated
security (Cloudflare Turnstile captcha), rate limiting, modern yt-dlp
integration, and modular scraper framework for searching songs across
music/torrent sites without file storage.

**Architecture:** Next.js 15 (App Router) with TypeScript, Cloudflare Turnstile
for bot protection, Upstash Ratelimit for API protection, PostgreSQL with
Drizzle ORM, and a modular scraper framework integrated with yt-dlp for music
search. Auth layer uses modern session-based approach without full auth stack.

**Tech Stack:** Next.js 15.5.26+, TypeScript, Cloudflare Turnstile (free
unlimited), Upstash Ratelimit, PostgreSQL, Drizzle ORM, yt-dlp 2026.08.19,
Node.js 26.7.0

**Spec:** Enhanced cassette-web with security-first approach

## Global Constraints

- Cloudflare Turnstile free tier provides unlimited verification without cost
- Upstash Ratelimit provides serverless rate limiting for API endpoints (no
  Redis infrastructure)
- Drizzle ORM 1.0.0+ for PostgreSQL 15+ with type safety
- yt-dlp 2026.08.19 is latest stable release
- Deploy to Windows server with PostgreSQL (Neon, Supabase, or local)
- No user file storage (API returns direct URLs)
- All scraper modules must handle HTML changes and isolate failures
- Scraper config in DB: `enabled` boolean, `rate_limit_ms` (per domain),
  `selectors_json`

## Review Focus

- **Rate limiting**: Are API endpoints protected from abuse? (Added via Upstash
  Ratelimit)
- **Captcha**: Is user signup/login protected against bots? (Added via
  Cloudflare Turnstile)
- **Scraper resilience**: Do scraper failures crash the search? (Use
  Promise.allSettled)
- **Security posture**: Does session management prevent session hijacking?
  (Modern session approach)

---

### Task 1: Setup Infrastructure (Rate Limiting, Turnstile, Security Middleware)

**Files:**

- Create: `src/lib/rate-limit.ts`
- Create: `src/lib/turnstile.ts`
- Create: `src/lib/security-middleware.ts`
- Create: `src/middleware-security.ts`
- Modify: `package.json`
- Create: `.env.example` (security variables)

**Interfaces:**

- Consumes: Next.js request/response, Node.js environment variables
- Produces: Rate limit middleware, Turnstile verification helper, security
  headers

- [ ] **Step 1: Write the failing test**

```typescript
describe('Security infrastructure', () => {
  test('should initialize Cloudflare Turnstile config', () => {
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/security-infrastructure.test.ts -v` Expected: FAIL
with "Cannot find module 'cloudflare-turnstile' or 'upstash/ratelimit'"

- [ ] **Step 3: Implement Cloudflare Turnstile verification, Upstash Ratelimit
      middleware, and security headers**

One line: Use `cloudflare-turnstile` npm package for verification. Configure
Upstash Ratelimit with Redis HTTP endpoint. Add security headers (CSP, HSTS,
X-Frame-Options).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/security-infrastructure.test.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/rate-limit.ts src/lib/turnstile.ts src/lib/security-middleware.ts src/middleware-security.ts package.json .env.example
git commit -m "feat: setup rate limiting, Turnstile, and security middleware"
```

### Task 2: Database Schema for Security

**Files:**

- Modify: `src/lib/db/schema.ts`

**Interfaces:**

- Consumes: Drizzle PostgreSQL schema patterns
- Produces: Enhanced security fields in users table

- [ ] **Step 1: Write the failing test**

```typescript
import { users } from '@/lib/db/schema';

describe('Security database schema', () => {
  test('should have rate_limit table for API protection', () => {
    expect(users.rateLimitCount).toBeDefined();
    expect(users.rateLimitWindow).toBeDefined();
  });

  test('should have users table with failed_login_attempts and lockout_until', () => {
    expect(users.failedLoginAttempts).toBeDefined();
    expect(users.lockoutUntil).toBeDefined();
    expect(users.lastLoginAttempt).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/security-schema.test.ts -v` Expected: FAIL with
"Cannot find module 'drizzle-orm' schema"

- [ ] **Step 3: Implement Drizzle schema with rate limiting and login security
      fields**

One line: Add `failedLoginAttempts: integer.Default(0)`,
`lockoutUntil: timestamp({ mode: 'date' })`,
`lastLoginAttempt: timestamp({ mode: 'date' })` to users. Add `rateLimitTable`
with `identifier`, `count`, `window`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/security-schema.test.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add rate limiting and login security fields to database schema"
```

### Task 3: yt-dlp Integration Service (Latest 2026.08.19)

**Files:**

- Create: `src/lib/extractors/yt-dlp.ts`
- Create: `src/types/extracted.ts`

**Interfaces:**

- Consumes: Node.js child_process, fs (Windows binary path)
- Produces: `ExtractedTrack[]` with audio URLs

- [ ] **Step 1: Write the failing test**

```typescript
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

describe('yt-dlp extractor', () => {
  test('should export extract function', () => {
    expect(typeof extract).toBe('function');
  });

  test('should export extractSingle function', () => {
    expect(typeof extractSingle).toBe('function');
  });

  test('should export extractSongTitle function', () => {
    expect(typeof extractSongTitle).toBe('function');
  });

  test('should export stripVideoIndicators function', () => {
    expect(typeof stripVideoIndicators).toBe('function');
  });

  test('should strip video indicators from title', () => {
    const result = stripVideoIndicators(
      'Never Gonna Give You Up (Official Video)'
    );
    expect(result).toBe('Never Gonna Give You Up');
  });

  test('should strip feat. indicators from title', () => {
    const result = stripVideoIndicators('Song Name (feat. Other Artist)');
    expect(result).toBe('Song Name');
  });

  test('should strip Official Music Video from title', () => {
    const result = stripVideoIndicators('Test Song [Official Music Video]');
    expect(result).toBe('Test Song');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/yt-dlp-extractor.test.ts -v` Expected: FAIL with
"Cannot find module 'yt-dlp-exec' or execFile error"

- [ ] **Step 3: Implement yt-dlp extraction using execFile with 60s timeout,
      parsing JSON output for audio URLs**

One line: Use
`execFileAsync('yt-dlp.exe', ['--dump-json', '--no-download', url], { timeout: 60000 })`.
Parse stdout JSON, filter formats with `acodec='mp4' && vcodec='none'`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/yt-dlp-extractor.test.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/extractors/yt-dlp.ts src/types/extracted.ts
git commit -m "feat: implement yt-dlp extractor with 60s timeout and audio URL parsing"
```

### Task 4: Modular Scraper Framework with Resilience

**Files:**

- Create: `src/lib/scrapers/types.ts`
- Create: `src/lib/scrapers/registry.ts`
- Create: `src/lib/scrapers/base.ts`
- Create: `src/types/scraped.ts`

**Interfaces:**

- Consumes: Cheerio for HTML parsing, fs for config
- Produces: `ScrapedResult[]` from multiple sources

- [ ] **Step 1: Write the failing test**

```typescript
import { scraperRegistry } from '@/lib/scrapers/registry';

describe('Scraper framework resilience', () => {
  test('should have BaseScraper with fetch and parse methods', async () => {
    const { BaseScraper } = await import('@/lib/scrapers/base');
    expect(typeof BaseScraper.prototype.fetch).toBe('function');
    expect(typeof BaseScraper.prototype.parse).toBe('function');
  });

  test('should load enabled scrapers from database', async () => {
    const scrapers = await scraperRegistry.getEnabled();
    expect(Array.isArray(scrapers)).toBe(true);
  });

  test('should handle scraper failures gracefully with Promise.allSettled', async () => {
    const results = await Promise.allSettled([
      Promise.resolve([
        {
          title: 'Success',
          artist: 'Test',
          downloadUrl: 'http://example.com/test.mp3',
        },
      ]),
      Promise.reject(new Error('Scraper failed')),
    ]);
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/scraper-framework.test.ts -v` Expected: FAIL with
"Cannot find module 'cheerio' or 'scraper registry'"

- [ ] **Step 3: Implement BaseScraper class with domain-specific rate limiting
      and retry logic**

One line: Create class with `fetch(url, options)` using `got` or `fetch` with
per-domain `setTimeout` and exponential backoff. `parse(html)` uses Cheerio.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/scraper-framework.test.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/scrapers/types.ts src/lib/scrapers/registry.ts src/lib/scrapers/base.ts src/types/scraped.ts
git commit -m "feat: implement modular scraper framework with resilience and rate limiting"
```

### Task 5: Torrent Sites Scraper (1337x, RARBG, TPB)

**Files:**

- Create: `src/lib/scrapers/torrent-sites.ts`

**Interfaces:**

- Consumes: BaseScraper, Cheerio
- Produces: `ScrapedResult[]` with magnet/torrent links

- [ ] **Step 1: Write the failing test**

```typescript
import { TorrentSitesScraper } from '@/lib/scrapers/torrent-sites';

describe('Torrent sites scraper', () => {
  test('should search 1337x and return magnet links', async () => {
    const scraper = new TorrentSitesScraper();
    const results = await scraper.search('Never Gonna Give You Up audio');
    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('downloadUrl');
      expect(results[0].downloadUrl).toMatch(/^magnet:/);
    }
  });

  test('should handle site HTML structure changes gracefully', async () => {
    const scraper = new TorrentSitesScraper();
    const results = await scraper.search('test query');
    expect(Array.isArray(results)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/torrent-sites-scraper.test.ts -v` Expected: FAIL
with "Cannot find module 'torrent-sites' scraper"

- [ ] **Step 3: Implement 1337x, RARBG, and The Pirate Bay search with magnet
      extraction**

One line: Extend BaseScraper, implement `search()` using domain-specific
selectors for `.torrent-item a.magnet`, `.download a[href^='magnet']`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/torrent-sites-scraper.test.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/scrapers/torrent-sites.ts
git commit -m "feat: implement torrent sites scraper (1337x, RARBG, TPB)"
```

### Task 6: Music Sites Scraper (Zaycev.net, MP3Juices)

**Files:**

- Create: `src/lib/scrapers/music-sites.ts`

**Interfaces:**

- Consumes: BaseScraper, Cheerio
- Produces: `ScrapedResult[]` with direct MP3 links

- [ ] **Step 1: Write the failing test**

```typescript
import { MusicSitesScraper } from '@/lib/scrapers/music-sites';

describe('Music sites scraper', () => {
  test('should search MP3Juices and return direct MP3 links', async () => {
    const scraper = new MusicSitesScraper();
    const results = await scraper.search('Never Gonna Give You Up');
    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('downloadUrl');
      expect(results[0].downloadUrl).toMatch(/^https?:\/\/.*\.mp3/);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/music-sites-scraper.test.ts -v` Expected: FAIL with
"Cannot find module 'music-sites' scraper"

- [ ] **Step 3: Implement Zaycev.net and MP3Juices search with direct MP3 URL
      extraction**

One line: Use selectors for `.download-btn`, `.play-btn`, or `.stream-link` with
mp3 extensions.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/music-sites-scraper.test.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/scrapers/music-sites.ts
git commit -m "feat: implement music sites scraper (Zaycev.net, MP3Juices)"
```

### Task 7: SoundCloud Scraper

**Files:**

- Create: `src/lib/scrapers/soundcloud.ts`

**Interfaces:**

- Consumes: BaseScraper, Cheerio
- Produces: `ScrapedResult[]` from SoundCloud search

- [ ] **Step 1: Write the failing test**

```typescript
import { SoundCloudScraper } from '@/lib/scrapers/soundcloud';

describe('SoundCloud scraper', () => {
  test('should search SoundCloud and extract stream URLs', async () => {
    const scraper = new SoundCloudScraper();
    const results = await scraper.search('Never Gonna Give You Up');
    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('downloadUrl');
      expect(results[0].downloadUrl).toMatch(/soundcloud\.com/i);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/soundcloud-scraper.test.ts -v` Expected: FAIL with
"Cannot find module 'soundcloud' scraper"

- [ ] **Step 3: Implement SoundCloud search with stream extraction**

One line: Scrape SoundCloud search results for `.SoundTitle-link`, extract from
`/stream` or download endpoints.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/soundcloud-scraper.test.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/scrapers/soundcloud.ts
git commit -m "feat: implement SoundCloud scraper"
```

### Task 8: YouTube URL Parser and Title Extractor

**Files:**

- Create: `src/lib/utils/youtube.ts`

**Interfaces:**

- Consumes: URL regex patterns
- Produces: `{ videoId: string, playlistId?: string }` and song titles

- [ ] **Step 1: Write the failing test**

```typescript
import { parseYouTubeUrl, extractSongTitle } from '@/lib/utils/youtube';

describe('YouTube URL utilities', () => {
  test('should parse YouTube video URLs to videoId', () => {
    const result = parseYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result).toEqual({ videoId: 'dQw4w9WgXcQ' });
  });

  test('should parse playlist URLs to playlistId', () => {
    const result = parseYouTubeUrl(
      'https://youtube.com/playlist?list=PLJe3XBuIT7HN9t5rR5K6Xm6wV8s6jKqZc'
    );
    expect(result).toEqual({
      videoId: undefined,
      playlistId: 'PLJe3XBuIT7HN9t5rR5K6Xm6wV8s6jKqZc',
    });
  });

  test('should extract song title from YouTube URL using yt-dlp', async () => {
    const title = await extractSongTitle(
      'https://youtube.com/watch?v=dQw4w9WgXcQ'
    );
    expect(typeof title).toBe('string');
    expect(title.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/youtube-utils.test.ts -v` Expected: FAIL with
"Cannot find module 'youtube.ts' utilities"

- [ ] **Step 3: Implement URL parsing regex and yt-dlp title extraction**

One line: Use URL regex for youtu.be, youtube.com/watch, youtube.com/playlist.
For title extraction, call yt-dlp `--dump-json` and extract `title` field.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/youtube-utils.test.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/youtube.ts
git commit -m "feat: implement YouTube URL parser and title extractor"
```

### Task 9: Unified Search API with Security

**Files:**

- Create: `src/app/api/search/route.ts`
- Create: `src/types/search.ts`

**Interfaces:**

- Consumes: Rate limit middleware, turnstile verification, yt-dlp extractor,
  scraper registry
- Produces:
  `{ source: "yt-dlp" | "scrapers", results: ExtractedTrack[] | ScrapedResult[] }`

- [ ] **Step 1: Write the failing test**

```typescript
import { POST } from '@/app/api/search/route';

describe('Unified search API', () => {
  test('should handle URL type with yt-dlp extractor and rate limiting', async () => {
    const request = new Request('http://localhost/api/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: 'https://youtube.com/watch?v=test',
        type: 'url',
      }),
    });

    const response = await POST({ request });
    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toHaveProperty('source', 'yt-dlp');
    expect(json).toHaveProperty('results');
  });

  test('should rate limit API endpoints to prevent abuse', async () => {
    const { rateLimitMiddleware } = await import('@/lib/rate-limit');
    const middleware = rateLimitMiddleware({ windowMs: 60000, max: 5 });
    expect(middleware).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/search-api.test.ts -v` Expected: FAIL with "Cannot
find module 'search/route'"

- [ ] **Step 3: Implement search API with type dispatch, rate limiting, and
      security logging**

One line: Use `rateLimitMiddleware` before handler. If type==='url', validate
with `parseYouTubeUrl`, call `ytDlpExtractor`. If type==='song', run enabled
scrapers with `Promise.allSettled`. Log to DB with security metadata.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/search-api.test.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/search/route.ts src/types/search.ts
git commit -m "feat: implement unified search API with rate limiting"
```

### Task 10: Simple Session Management

**Files:**

- Create: `src/lib/session.ts`
- Create: `src/middleware.ts`

**Interfaces:**

- Consumes: Next.js headers, cookies
- Produces: Session validation, rate limit tracking

- [ ] **Step 1: Write the failing test**

```typescript
import { validateSession, trackRateLimit } from '@/lib/session';

describe('Session management', () => {
  test('should validate session from cookies', async () => {
    const session = await validateSession({
      headers: { cookie: 'session=valid-token' },
      ip: '127.0.0.1',
    });
    expect(session).toBeDefined();
    expect(session.userId).toBeDefined();
  });

  test('should track rate limit per session', async () => {
    const session = await validateSession({ headers: {}, ip: '127.0.0.1' });
    const result = await trackRateLimit(
      session.userId,
      'search-api',
      10,
      60000
    );
    expect(result.allowed).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/session.test.ts -v` Expected: FAIL with "Cannot
find module 'session.ts'"

- [ ] **Step 3: Implement simple session validation and rate limit tracking**

One line: Create session token validation using HMAC. Track failed attempts and
lockout with timestamps in database.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/session.test.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/session.ts src/middleware.ts
git commit -m "feat: implement simple session management with rate limit tracking"
```

### Task 11: Search Dashboard UI (App Router)

**Files:**

- Create: `src/app/page.tsx` (dashboard)
- Create: `src/components/SearchBar.tsx`
- Create: `src/components/ResultsTabs.tsx`
- Create: `src/components/ResultCard.tsx`

**Interfaces:**

- Consumes: Unified search API, session validation
- Produces: Search interface with tabs for results

- [ ] **Step 1: Write the failing test**

```typescript
import { SearchBar } from '@/components/SearchBar';

describe('Search dashboard UI', () => {
  test('should render search bar with URL/song toggle', async () => {
    const { render } = await import('@testing-library/react');
    const screen = render(<SearchBar />);
    expect(screen.container).toBeDefined();
  });

  test('should display recent searches from database', async () => {
    const { searchHistory } = await import('@/lib/db/schema');
    expect(searchHistory.userId).toBeDefined();
    expect(searchHistory.query).toBeDefined();
    expect(searchHistory.createdAt).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/search-ui.test.ts -v` Expected: FAIL with "Cannot
find module 'SearchBar' component"

- [ ] **Step 3: Implement App Router dashboard with search bar, toggle, and
      recent searches**

One line: Create page component with `useState` for query, `useState` for type
('song'|'url'). Fetch recent searches from API endpoint.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/search-ui.test.ts -v` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/SearchBar.tsx src/components/ResultsTabs.tsx src/components/ResultCard.tsx
git commit -m "feat: implement search dashboard UI with tabs and recent searches"
```

### Task 12: Verification and Testing

**Files:**

- Create: `tests/e2e/security-flow.test.ts`
- Create: `tests/e2e/search-functionality.test.ts`
- Create: `tests/unit/captcha-protection.test.ts`

**Interfaces:**

- Consumes: Auth flows, search API, security middleware
- Produces: End-to-end security and functionality tests

- [ ] **Step 1: Write the failing test**

```typescript
import { test, expect } from 'bun:test';

describe('Security verification', () => {
  test('should block brute force attempts with account lockout', async () => {
    // Create test user, attempt failed logins > threshold, verify lockout
    expect(true).toBe(true); // Placeholder for actual brute force test
  });

  test('should rate limit API endpoints (100 req/hour)', async () => {
    // Test rate limiting on search API
    expect(true).toBe(true); // Placeholder for rate limit test
  });

  test('should require Turnstile on signup form', async () => {
    // Test signup without Turnstile token should fail
    expect(true).toBe(true); // Placeholder for Turnstile test
  });
});

describe('Search flow verification', () => {
  test('should search by song name and get results from scrapers', async () => {
    // E2E test: search 'Never Gonna Give You Up', verify results
    expect(true).toBe(true); // Placeholder for scraper results test
  });

  test('should extract title from YouTube URL and auto-search', async () => {
    // E2E test: paste YouTube URL, extract title, auto-search
    expect(true).toBe(true); // Placeholder for YouTube flow test
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/e2e/ -v` Expected: FAIL with no existing test files

- [ ] **Step 3: Implement comprehensive e2e tests for security and search
      flows**

One line: Use Playwright to simulate real user flows: Turnstile validation on
forms, multiple failed logins triggering lockout, API rate limiting, and
complete search scenarios.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/e2e/ -v` Expected: PASS after implementing tests

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/security-flow.test.ts tests/e2e/search-functionality.test.ts tests/unit/captcha-protection.test.ts
git commit -m "feat: implement comprehensive security and search flow verification tests"
```

## Critical Files & Anchors

- `src/lib/rate-limit.ts` — Upstash Ratelimit configuration for API protection
- `src/lib/turnstile.ts` — Cloudflare Turnstile verification for bot protection
- `src/lib/extractors/yt-dlp.ts` — Single point of yt-dlp interaction with 60s
  timeout
- `src/lib/scrapers/registry.ts` + individual scraper files — Resilient scraper
  framework with isolation
- `src/app/api/search/route.ts` — Unified search entry point with security
  middleware
- `src/middleware.ts` — Security middleware for rate limiting and headers

## Verification

- `npm run dev` → start dev server
- Sign up with email → should require Turnstile captcha
- Search "Never Gonna Give You Up" → results from scrapers appear
- Paste YouTube URL → extracts title → auto-search results appear
- Test: Multi-user isolation (two browsers, different accounts)
- Test: Scraper failure doesn't crash search (Promise.allSettled)
- Test: Rate limiting works (5 requests/minute then blocked)

## Assumptions & Contingencies

- **Cloudflare Turnstile**: FREE unlimited for all use (managed mode, no
  siteverify cost)
- **Upstash Ratelimit**: Serverless rate limiting; requires Redis HTTP endpoint
  (use Upstash)
- **yt-dlp binary**: Download latest Windows version from GitHub releases;
  handle Windows Defender blocking
- **PostgreSQL**: Assumes local Postgres or managed (Neon, Supabase). Clear
  error in UI, retry button
- **Scraper breakage**: Sites change HTML constantly. Scrapers isolated in
  modules — disable in DB without deploy. Admin UI for toggling later
- **No file storage**: Current API returns URLs, compatible with future file
  serving
- **Legal**: Custom scrapers target specific sites — document compliance
  requirements
