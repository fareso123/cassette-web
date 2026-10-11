# Proposal

## Why

Cassette Web currently resolves YouTube URLs to direct audio links via yt-dlp and searches song names across scraper sources, but has no download capability. Users want to download tracks from premium sources (Qobuz, Tidal, Amazon Music, YouTube Music) at their highest available quality (FLAC, Hi-Res, Dolby Atmos) for personal archival. This change adds a download resources section to search results with per-source quality selection, credential management for authenticated sources, and direct browser downloads.

## What Changes

**New Capabilities:**
- Download resources panel in search results showing available qualities per source
- Credential management (localStorage) for Qobuz, Tidal, Amazon Music, YouTube Music
- Global quality preference with per-source overrides
- Direct browser streaming downloads via Next.js API routes
- DMCA notice in footer
- Extended scraper interface to support `downloadProvider` capability

**Modified Components:**
- `src/components/SearchResultsDropdown.tsx` — add "Download" tab/button
- `src/components/ResultsTabs.tsx` — support download resources display
- `src/lib/scrapers/base.ts` — add `DownloadProvider` interface and `downloadable` flag to `ScrapedResult`
- `src/app/api/search/route.ts` — include download metadata in response
- `src/app/api/download/[source]/route.ts` — new API routes for streaming downloads
- `src/app/globals.css` — add DMCA footer notice
- `src/components/SettingsPanel.tsx` — new component for credential/quality management

**Out of Scope:**
- User accounts / server-side credential storage (uses localStorage only)
- Background job queue / server-side file storage
- DRM removal or decryption (only streams already-accessible content)
- Spotify, Apple Music download (no viable public API)

## Capabilities

### New Capabilities

- `download/resources` — Download resources discovery and presentation in search results
- `download/credentials` — Client-side credential management for authenticated sources
- `download/quality` — Global and per-source quality preference system
- `download/streaming` — Direct browser streaming via API routes