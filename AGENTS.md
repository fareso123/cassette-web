# Repository Guidelines

## Project Overview

**Cassette Web** is a music search/link resolver. Paste a YouTube URL and it
returns direct audio links via `yt-dlp`; type a song name and it fans out
across music and torrent scrapers.

Key features:
- Next.js 15 App Router, React 19, TypeScript strict
- Tailwind CSS 4 + daisyUI 5 with a custom `cassette` design system
- Modular scraper framework, configured from the database
- Upstash rate limiting, Cloudflare Turnstile (not yet wired in)
- PostgreSQL via Drizzle ORM

## Project Structure

All source lives under `src/`.

```
src/
├── app/
│   ├── layout.tsx           # Root layout: fonts, Navbar, Footer, skip link
│   ├── page.tsx             # Search dashboard (client component)
│   ├── globals.css          # daisyUI themes + design tokens
│   └── api/search/route.ts  # The only API route
├── components/              # SearchBar, ResultsTabs, ResultCard, Navbar,
│                            # Footer, HeroSection, ThemeController
├── lib/
│   ├── env.ts               # Zod-validated env; throws at import if invalid
│   ├── db/                  # schema.ts (tables), index.ts (drizzle client)
│   ├── extractors/yt-dlp.ts # Shells out to the yt-dlp binary
│   ├── scrapers/            # base.ts, registry.ts, and one file per source
│   ├── rate-limit.ts        # Upstash; no-ops when Upstash env is absent
│   ├── security-middleware.ts
│   ├── session.ts           # HMAC tokens, per-session rate limit
│   ├── search-history.ts    # search_history reads/writes
│   ├── turnstile.ts         # Not called by any route yet
│   └── utils/youtube.ts     # YouTube URL parsing
├── types/                   # extracted.ts, scraped.ts, search.ts
├── middleware.ts            # Edge middleware: security headers only
└── __tests__/               # bun:test

drizzle.config.ts           # Drizzle Kit config
drizzle/                    # Generated migrations
scripts/seed.ts              # Inserts the default scrapers
```

Design reference: `design2.md` documents the brutalist/mono design system.
The themes in `globals.css` implement it.

## Data Flow

1. `page.tsx` POSTs `{ query, type }` to `/api/search`
2. Route reads the session if one is present, then rate-limits by user id
   (500/min) or IP (100/min), then dispatches on `type`:
   - `url` → `parseYouTubeUrl` validation → `extract()` from yt-dlp
   - `song` → `scraperRegistry.getEnabled()` → parallel `search()` per
     scraper → dedupe by `downloadUrl`
3. Signed-in searches are appended to `search_history`; anonymous ones are
   not persisted
4. Response is a `SearchResponse`; the client splits it on the presence of
   `directAudioUrl` and renders tabs

Scrapers are **database-driven**. `registry.ts` reads the `scrapers` table
at first use and maps `name` → class. With no rows, song search returns
nothing.

## Development Commands

```bash
npm install
npm run dev          # dev server
npm run build        # production build
npm start            # serve the build

npm test             # bun test
npm run test:watch
bun test src/__tests__/session.test.ts   # single file

npm run lint         # eslint src  (NOT `next lint`, deprecated)
npm run format       # prettier --write .
npm run format:check
```

Database:

```bash
npm run db:push      # apply schema directly (dev)
npm run db:generate  # write a migration from schema changes
npm run db:migrate   # apply migrations
npm run db:seed      # insert the default scrapers
npm run db:studio    # browse data
```

First-time setup: `db:push` (or `db:migrate`) then `db:seed`. Without the
seed, song search returns nothing.

## Tooling

- **Node.js**: >= 26.0.0
- **Package manager**: npm
- **TypeScript**: strict mode, `@/*` → `./src/*`
- **Testing**: `bun:test` (`import { describe, test, expect } from 'bun:test'`)
- **Linting**: ESLint 10 flat config (`eslint.config.mjs`)
- **Styling**: Tailwind CSS 4 + daisyUI 5, no `tailwind.config.js`
- **Build**: Next.js 15.5.26

### ESLint notes

`eslint.config.mjs` strips `react/*` rules from the shared Next configs. The
nested `eslint-plugin-react` calls `context.getFilename()`, removed in
ESLint 10, and crashes when it loads a rule. The plugin cannot be removed
because the Next configs require it. Revisit when
`eslint-config-next` updates its peer plugin.

## Environment

Validated by Zod in `src/lib/env.ts` at import time. A missing required
value throws on startup.

```
DATABASE_URL            required, URL
NEXTAUTH_SECRET         required, min 32 chars
NEXTAUTH_URL            optional, URL
YT_DLP_PATH             default yt-dlp.exe
FFMPEG_PATH             default ffmpeg.exe
UPSTASH_REDIS_URL       optional, URL
UPSTASH_REDIS_TOKEN     optional
TURNSTILE_SITE_KEY      optional
TURNSTILE_SECRET_KEY    optional
NODE_ENV                development | production | test
```

Behaviour when optional vars are absent:
- No Upstash → `checkRateLimit` always allows
- No Turnstile → `verifyToken` returns `missing-secret-key`
- No DB → `scraperRegistry.getEnabled()` returns empty; song search is empty

## Conventions

- **Components**: `PascalCase`, exported by name (`export function SearchBar`)
- **Types**: `PascalCase`; result shapes live in `src/types/`
- **Files**: one concern per file, kebab or camel matching the directory style
- **Styling**: daisyUI classes first, Tailwind utilities for the rest.
  Avoid inline `style={{}}` except for `var(--font-*)` bindings and the
  gradient strip
- **Imports**: React → Next → third-party → local → types

### Two result shapes, one card

`ExtractedTrack` (yt-dlp) and `ScrapedResult` (scrapers) carry their URL
under different keys and share no URL field. `ResultsTabs.toCard()`
normalizes both into `ResultCard`'s props. **Do not spread a result
directly into `ResultCard`** — that was the bug that made every YouTube
result look un-downloadable.

### Theming

`cassette` and `cassette-light` are the two registered daisyUI themes.
`ThemeController` toggles them and syncs `localStorage` through a
`storage` event. Do not hardcode `data-theme` in `layout.tsx`; React
overwrites it on re-render.

## Known Gaps

Things that look implemented but are not. Verify before relying on them:

- **No signup or login.** The session layer verifies tokens and the search
  route reads them, but nothing issues a cookie yet, so in practice every
  caller is anonymous. A valid token raises the rate limit and records
  history; absent that, the user-facing search history in the dashboard is
  still `localStorage`.
- **Turnstile is not called.** `verifyToken` exists; no route invokes it.
- **`middleware.ts` does not rate-limit.** Edge runtime cannot use
  `@upstash/redis`; the route does it instead.
- **Scraper selectors are unverified.** The seed's CSS selectors were
  written from the sites' expected markup and have not been checked
  against the live pages. Expect to correct them.
- **The `users` table is unused.** Nothing signs anyone in, so there are
  no rows and `search_history.user_id` references rows that cannot exist.
- **`getRecentSearches` and `clearSearchHistory` are unused.** Written
  alongside `recordSearch`; no endpoint exposes them yet.
- **The session rate-limit test logs a Drizzle error.** There is no
  database in the test env, so the query fails and `trackRateLimit` fails
  open. That is the tested behaviour, not a failure, but it looks alarming.
- **ESLint runs clean** (0 errors, 0 warnings) as of this writing.

## Where to Start

1. `src/app/api/search/route.ts` — the request path, end to end
2. `src/lib/scrapers/registry.ts` — how sources are configured and loaded
3. `src/lib/session.ts` — the auth primitives and their gaps
4. `src/app/globals.css` — the design tokens every component reads
