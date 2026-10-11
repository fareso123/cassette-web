# Design: Download Resources

## Context

Current state (see proposal.md - Why):
- Cassette Web has a scraper framework (`src/lib/scrapers/`) with database-driven registry
- Search API (`/api/search`) returns `ExtractedTrack` (yt-dlp) or `ScrapedResult` (scrapers)
- Results displayed via `ResultsTabs` → `ResultCard` → `SearchResultsDropdown`
- No user accounts; session auth exists but unused (HMAC tokens, rate limiting)
- Queue panel exists for tracking (`QueuePanel`, `QueueProvider`)
- `react-resizable-panels` used for details panel

Constraints:
- **No server-side credential storage** — localStorage only (per spec)
- **Direct browser streaming** — no server persistence (per spec)
- **Four authenticated sources** — Qobuz, Tidal, Amazon, YouTube Music
- **No existing auth system** — credentials entered per-source in settings

## Goals / Non-Goals

**Goals:**
- Add `DownloadProvider` interface to scraper base
- Extend `ScrapedResult` with `downloadResources` metadata
- New `/api/download/[source]` routes for streaming
- Settings panel for credential/quality management
- Download resources UI in search results
- DMCA footer notice

**Non-Goals:**
- User accounts / server DB for credentials
- Background job queue / server file storage
- DRM decryption
- Spotify, Apple Music download

## Decisions

### 1. Scraper Interface Extension

**Decision:** Add optional `DownloadProvider` class to `src/lib/scrapers/base.ts`

```typescript
export interface QualityOption {
  id: string;
  label: string;
  description?: string;
  kind: 'lossless' | 'lossy' | 'spatial';
  estimatedSizeMB?: number;
}

export interface DownloadResource {
  sourceId: string;
  sourceDisplayName: string;
  qualityOptions: QualityOption[];
  requiresAuth: boolean;
  trackId: string;        // source-specific track identifier
  trackMetadata?: any;    // source-specific metadata for download
}

export interface DownloadProvider {
  getDownloadResources(track: ScrapedResult): Promise<DownloadResource[]>;
  getDownloadStream(trackId: string, qualityId: string, credentials: Record<string, string>): Promise<ReadableStream>;
  getQualities(): QualityOption[];
  validateCredentials(credentials: Record<string, string>): Promise<boolean>;
}
```

**Rationale:** Keeps download logic co-located with scraper. Sources without download capability simply don't implement `DownloadProvider`. Existing scrapers (SoundCloud, etc.) can opt in.

**Alternative considered:** Separate download module. Rejected — duplicates scraper's search/metadata logic.

### 2. Search API Response Extension

**Decision:** Extend `SearchResponse` to include download resources for song searches

```typescript
// src/types/search.ts
export interface SearchResponse {
  results: (ExtractedTrack | ScrapedResult)[];
  authenticated: boolean;
  downloadResources?: Record<string, DownloadResource[]>; // keyed by result index
}
```

**Rationale:** Single API call returns everything. Frontend doesn't need second call for download metadata.

### 3. Download API Routes

**Decision:** One route per source at `/api/download/[source]/route.ts`

```
GET /api/download/qobuz?trackId=123&quality=HI_RES_LOSSLESS
GET /api/download/tidal?trackId=456&quality=LOSSLESS
GET /api/download/amazon?trackId=B09X&quality=FLAC_BEST
GET /api/download/ytmusic?trackId=xyz&quality=BEST
```

**Request:** Credentials passed via `x-source-credentials` header (JSON string) or body
**Response:** Stream with `Content-Disposition: attachment; filename="..."`

**Rationale:** Clean separation per source. Easy to add/remove sources. Credentials never touch server logs.

### 4. Credential Storage Schema (localStorage)

**Decision:** Namespaced keys with JSON-serialized credential objects

```typescript
// Key format: `cassette.credentials.{sourceId}`
// Value: JSON string of credential object

// Qobuz: { appId: "xxx", userAuthToken: "yyy" }
// Tidal: { token: "xxx", userId: "yyy", countryCode: "US" }
// Amazon: { csrfToken: "xxx", sessionId: "yyy", deviceId: "zzz" }
// YouTube Music: { cookie: "..." } or { apiKey: "..." }
```

**Rationale:** Simple, no migration needed. Source-specific structure. Easy to clear per-source.

### 5. Quality Preference Schema (localStorage)

**Decision:** Global + per-source overrides

```typescript
// Global: `cassette.download.quality.global` = "FLAC_BEST" | "FLAC_24BIT" | "FLAC_16BIT" | "MP3_320" | "AUTO"
// Override: `cassette.download.quality.{sourceId}` = same enum
```

**Rationale:** Matches spec requirement for global + override. Simple string values.

### 6. Settings Panel Component

**Decision:** New `SettingsPanel` component accessible via a settings button in navbar

- Tabbed: Credentials | Quality | About
- Credentials tab: card per source with status, textarea, save/remove
- Quality tab: global select + per-source override selects
- About tab: DMCA notice, version, links

**Rationale:** Centralized management. Reuses existing UI patterns (shadcn/ui Card, Tabs, Button, Textarea).

### 7. Download Resources UI in Results

**Decision:** Add "Download" tab to `ResultsTabs` (alongside existing Audio/Video tabs)

- Shows expandable list per result
- Each source: quality badge, auth status, download button
- Clicking download → calls API route with credentials from localStorage

**Rationale:** Keeps all result actions in one component. Consistent with existing tab pattern.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Source APIs change/break | Abstract `DownloadProvider` interface; each source isolated |
| Credentials exposed in localStorage | Warn user; only sent to same-origin API routes |
| Rate limiting from sources | Respect `Retry-After`; surface 429 to user |
| Large file streaming memory | Use `ReadableStream` piping; no buffering |
| CORS on source APIs | Proxy through our API routes (same-origin) |
| No user accounts = no sync | Acceptable per scope; credentials per-browser |
| Legal liability | DMCA footer + personal-use notice; no DRM circumvention |

## File Map

```
src/
├── lib/
│   ├── scrapers/
│   │   ├── base.ts              ← + DownloadProvider interface
│   │   ├── registry.ts          ← + load DownloadProvider
│   │   ├── qobuz.ts             ← + DownloadProvider impl
│   │   ├── tidal.ts             ← + DownloadProvider impl
│   │   ├── amazon.ts            ← + DownloadProvider impl
│   │   └── ytmusic.ts           ← + DownloadProvider impl
│   ├── credentials.ts           ← localStorage helpers
│   └── quality.ts               ← quality preference helpers
├── app/
│   ├── api/
│   │   ├── search/route.ts      ← + downloadResources in response
│   │   └── download/
│   │       ├── qobuz/route.ts
│   │       ├── tidal/route.ts
│   │       ├── amazon/route.ts
│   │       └── ytmusic/route.ts
│   └── globals.css              ← + DMCA footer notice
├── components/
│   ├── SettingsPanel.tsx        ← new
│   ├── ResultsTabs.tsx          ← + Download tab
│   ├── ResultCard.tsx           ← + download resources prop
│   └── Navbar.tsx               ← + Settings button
├── types/
│   ├── search.ts                ← + downloadResources types
│   └── download.ts              ← new: DownloadResource, QualityOption
```

## Sequence: Download Flow

```
User clicks download button
         │
         ▼
Frontend reads credentials from localStorage
         │
         ▼
GET /api/download/{source}?trackId=...&quality=...
         │
         ▼ (x-source-credentials header)
API route validates credentials
         │
         ▼
DownloadProvider.getDownloadStream(trackId, quality, credentials)
         │
         ▼ (source-specific API calls)
Stream piped to Response with Content-Disposition
         │
         ▼
Browser shows Save As dialog
```