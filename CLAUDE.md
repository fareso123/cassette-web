# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Cassette Web is a music search/link resolver: YouTube URLs go through `yt-dlp` for direct audio, song queries fan out across database-driven scrapers.

**Request path:** `page.tsx` → `POST /api/search` → rate-limit → dispatch by type → `yt-dlp` or scraper registry → `SearchResponse` → client splits on `directAudioUrl` presence for tabs.

**Queue system:** A client-side `QueueProvider` handles a persisted `localStorage` download queue, enabling batch downloads. Normalized `QueuedTrack` items are rendered via `QueuePanel`.

**Scrapers** are database-driven via `ScraperRegistryImpl` — reads the `scrapers` table on first use, maps `name` → class. Registry currently wires three scraper types: torrent-sites, music-sites, soundcloud.

**Theming:** `globals.css` tokens on `:root`/`.dark` mapped via `@theme inline`. `ThemeProvider` owns the `dark` class on `<html>` (React-rendered via `RootDocument`). Two load-bearing contrast rules enforced by `tokens-contrast.test.ts`: `--muted-foreground` must be a solid colour (no alpha washes), `--primary-foreground` is near-black `#1c201c` (not white).

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm test             # bun test (all __tests__)
bun test src/__tests__/session.test.ts   # single file
bun test --watch     # watch mode
npm run lint         # eslint src scripts
npm run format       # prettier --write .
npm run format:check # dry-run format check

npm run db:push      # apply schema directly (dev, no migration)
npm run db:generate  # write a migration from schema changes
npm run db:migrate   # apply migrations
npm run db:seed      # insert default scrapers — required for song search
npm run db:studio    # Drizzle Kit studio UI
```

`npm run db:seed` must be run after `db:push`/`db:migrate` before song search works. Without a reachable Postgres the scraper registry is empty and `/api/search` returns zero results for song queries.

## Critical Conventions

- **Two result shapes, one card:** `ExtractedTrack` carries `directAudioUrl`; `ScrapedResult` carries `downloadUrl`. `ResultsTabs.toCard()` normalizes both — never spread a result directly into `ResultCard`.
- **Queuing:** `QueueProvider` handles normalization and persistence. Use `useQueue()` to manage additions.
- **Theming:** never toggle `dark` class imperatively — React owns it. `suppressHydrationWarning` on `<html>` prevents mismatch with `themeInitScript`.
- **No signup/login** exists yet — every caller is anonymous in practice.
- **Styling:** shadcn primitives first; `className` carries layout only, never colour or type overrides. Use semantic tokens (`bg-background`, `text-muted-foreground`), never raw palette values.
- **shadcn components** live under `src/components/ui/` and are treated as vendored source. Edit deliberately; prefer `npx shadcn@latest add <comp> --diff <file>` before overwriting.

## Test surface

Static gates and lib tests: `src/__tests__/` contains `tokens-contrast`, `no-daisyui`, `session`, `search-api`, `security-infrastructure`, `yt-dlp-extractor`, `youtube-utils`. No component/render tests exist yet.
