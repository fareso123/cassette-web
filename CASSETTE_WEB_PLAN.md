# cassette-web Implementation Plan

## Context
Build a multi-user music search/link resolver website where users authenticate, search for songs by name across music/torrent sites, or paste YouTube/SoundCloud/Bandcamp URLs to extract the track and find download links. The app returns direct download URLs — no file storage, no downloads, no web player. Stack: Next.js 15 (App Router) + TypeScript + Node.js 26 + PostgreSQL + Drizzle ORM + NextAuth.js (credentials). Windows server deployment.

## Approach

### 1. Project scaffolding
- `npx create-next-app@latest cassette-web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack` in `C:/Users/fff/Projects/cassette-web`
- Install deps:
  - `next-auth@beta`, `drizzle-orm`, `postgres` (or `pg`), `drizzle-kit` (dev)
  - `zod`, `clsx`, `tailwind-merge`, `lucide-react`, `date-fns`
  - `yt-dlp-exec` or spawn `yt-dlp.exe` directly
  - `cheerio` for HTML parsing in custom scrapers
- Add `yt-dlp.exe` to `public/bin/` (download from https://github.com/yt-dlp/yt-dlp/releases/latest) and `ffmpeg.exe` alongside it

### 2. Database schema (PostgreSQL + Drizzle)
`src/lib/db/schema.ts` — tables:
- `users`: id (uuid), email, password_hash, created_at
- `search_history`: id, user_id, query, query_type (song_name|url), results_count, created_at
- `scrapers`: id, name, base_url, enabled, config_json, last_run, success_rate (admin-managed scraper registry)

Run migrations via `drizzle-kit push` in dev, `drizzle-kit migrate` in prod.

### 3. Auth (NextAuth.js v5 beta, credentials provider)
- `src/lib/auth.ts`: `NextAuthOptions` with `credentials` provider, `bcrypt` for password hash, JWT strategy, 30-day session cookie
- `src/app/api/auth/[...nextauth]/route.ts`: handler export
- `src/middleware.ts`: protect all routes except `/auth/*`, `/api/auth/*`
- Pages: `/auth/signin`, `/auth/signup` (server actions for form submit)

### 4. yt-dlp URL extractor service
`src/lib/extractors/yt-dlp.ts`:
- `extract(url: string) => Promise<ExtractedTrack[]>` — runs `yt-dlp.exe --dump-json --no-download <url>`, parses JSON for:
  - Single video: title, artist (uploader), duration, thumbnails, direct audio URL (format_id with audio only), webpage_url
  - Playlist: flat list of entries with same fields
- Returns normalized `ExtractedTrack[]` for UI
- Timeout 60s, stderr captured for errors

### 5. Custom scraper framework
`src/lib/scrapers/`:
- `types.ts`: `Scraper` interface — `search(query: string): Promise<ScrapedResult[]>`, `getResultLink(result): string`, `getResultTitle(result): string`
- `registry.ts`: in-memory map of enabled scrapers from DB, lazy-loaded
- `base.ts`: `BaseScraper` class with `fetch(url)`, `parse(html)`, retry/timeout logic, rate limiting per domain
- Individual scrapers (add as files, auto-registered):
  - `torrent-sites.ts` — search 1337x, RARBG mirrors, The Pirate Bay proxies for audio torrents, extract magnet/ torrent links
  - `music-cracking.ts` — search known music download sites (zaycev.net, mp3juices, etc.) for direct mp3 links
  - `soundcloud.ts` — search SoundCloud via HTML scrape (yt-dlp also works, but this gives search)
- Scraper config in DB: `enabled`, `rate_limit_ms`, `selectors_json` (CSS selectors for result parsing)

### 6. Unified search API
`src/app/api/search/route.ts` (POST):
- Input: `{ query: string, type: "song" | "url" }`
- If `type === "url"`:
  - Validate URL, call `ytDlpExtractor.extract(url)`
  - Return `{ source: "yt-dlp", results: ExtractedTrack[] }`
- If `type === "song"`:
  - Run all enabled scrapers in parallel (Promise.allSettled)
  - Normalize results: `{ title, artist, source_site, download_url, quality, size, scraper_name }`
  - Dedupe by download_url (keep first)
  - Return `{ source: "scrapers", results: ScrapedResult[] }`
- Log search to `search_history` table

### 7. YouTube link → song name → search
`src/lib/utils/youtube.ts`:
- `parseYouTubeUrl(url) => { videoId, playlistId? }` — regex for youtu.be, youtube.com/watch, youtube.com/playlist
- `extractSongTitle(url) => string` — call yt-dlp `--dump-json` on URL, return `title`, strip "(Official Video)", "feat.", etc.
- Search flow: paste YouTube URL → extract title → auto-run song search

### 8. UI (App Router, Server Components + Client Components)
- Layout: `src/app/layout.tsx` — providers, header with user menu, sign out
- `/` (dashboard): search bar (song name or URL), radio toggle "Song Name" / "URL", recent searches
- `/search` (results): tabs for "Direct Links" (scrapers) and "YouTube/Streaming" (yt-dlp), each result card shows title, artist, source, quality, "Copy Link" / "Open" buttons
- Components: `SearchBar`, `ResultsTabs`, `ResultCard`, `ScraperResultCard`, `YtDlpResultCard`
- Styling: Tailwind + shadcn/ui patterns (copy primitives, no dep)

### 9. Configuration & scripts
- `.env.example`: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `YT_DLP_PATH`, `FFMPEG_PATH`
- `package.json` scripts: `dev`, `build`, `start`, `db:push`, `db:migrate`, `db:studio`

### 10. Verification
- `npm run dev` → sign up → search "Never Gonna Give You Up" → results from scrapers appear with direct links
- Paste YouTube URL → extracts title → searches → results appear
- Paste SoundCloud URL → yt-dlp extracts direct audio URL
- Test: multi-user isolation (two browsers, different accounts)
- Test: scraper failure doesn't crash search (Promise.allSettled)
- Test: rate limiting works per scraper domain

## Critical Files & Anchors
- `src/lib/db/schema.ts` — all Drizzle table definitions
- `src/lib/extractors/yt-dlp.ts` — single point of yt-dlp interaction
- `src/lib/scrapers/registry.ts` + individual scraper files — scraper framework
- `src/app/api/search/route.ts` — unified search entry point
- `src/middleware.ts` — auth gate

## Assumptions & Contingencies
- **yt-dlp binary**: if Windows Defender blocks, user must allow/whitelist. Fallback: document manual install via winget/scoop.
- **PostgreSQL**: assumes local Postgres or managed (Neon, Supabase). If connection fails: clear error in UI, retry button.
- **Scraper breakage**: sites change HTML constantly. Scrapers are isolated modules — disable in DB `scrapers` table without deploy. Admin UI for toggling later.
- **No file storage**: if user wants downloads later, add file serving + worker as new phase — current API returns URLs, compatible.
- **Legal**: custom scrapers target specific sites — document that operators must comply with local laws.