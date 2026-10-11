# Tasks: Download Resources

## 1. Core Types & Interfaces

- [x] 1.1 Create `src/types/download.ts` with `QualityOption`, `DownloadResource`, `DownloadProvider` interfaces
- [x] 1.2 Extend `src/types/scraped.ts` `ScrapedResult` with optional `downloadResources?: DownloadResource[]`
- [x] 1.3 Extend `src/types/search.ts` `SearchResponse` with optional `downloadResources?: Record<string, DownloadResource[]>`
- [x] 1.4 Update `src/lib/scrapers/base.ts` to export `DownloadProvider` interface and add optional `getDownloadProvider()` method to base scraper

## 2. Credential & Quality Helpers

- [x] 2.1 Create `src/lib/credentials.ts` with `getCredentials(sourceId)`, `setCredentials(sourceId, creds)`, `removeCredentials(sourceId)`, `hasCredentials(sourceId)` using localStorage
- [x] 2.2 Create `src/lib/quality.ts` with `getGlobalQuality()`, `setGlobalQuality(q)`, `getSourceQuality(sourceId)`, `setSourceQuality(sourceId, q)`, `getEffectiveQuality(sourceId)`, quality option constants
- [x] 2.3 Add TypeScript types for credential shapes per source (Qobuz, Tidal, Amazon, YTMusic)

## 3. Download Provider Implementations

- [x] 3.1 Create `src/lib/scrapers/qobuz.ts` implementing `DownloadProvider` using Qobuz API (requires Zarz session or user cookies)
- [x] 3.2 Create `src/lib/scrapers/tidal.ts` implementing `DownloadProvider` using Tidal API (requires Zarz session or user tokens)
- [x] 3.3 Create `src/lib/scrapers/amazon.ts` implementing `DownloadProvider` using Amazon Music web API (requires session/CSRF)
- [x] 3.4 Create `src/lib/scrapers/ytmusic.ts` implementing `DownloadProvider` using YouTube Music API (requires cookie or innerTube)
- [x] 3.5 Update `src/lib/scrapers/registry.ts` to load `DownloadProvider` instances and expose via `getDownloadProvider(sourceId)`

## 4. Search API Integration

- [x] 4.1 Modify `src/app/api/search/route.ts` to call `getDownloadResources()` for each song search result
- [x] 4.2 Include `downloadResources` in `SearchResponse` keyed by result index
- [x] 4.3 Handle missing download providers gracefully (return empty array)

## 5. Download API Routes

- [x] 5.1 Create `src/app/api/download/qobuz/route.ts` — GET handler streaming Qobuz download
- [x] 5.2 Create `src/app/api/download/tidal/route.ts` — GET handler streaming Tidal download
- [x] 5.3 Create `src/app/api/download/amazon/route.ts` — GET handler streaming Amazon download
- [x] 5.4 Create `src/app/api/download/ytmusic/route.ts` — GET handler streaming YouTube Music download
- [x] 5.5 Each route: read credentials from `x-source-credentials` header, validate, call provider, pipe stream with proper headers

## 6. Settings Panel UI

- [x] 6.1 Create `src/components/SettingsPanel.tsx` with tabs: Credentials, Quality, About
- [x] 6.2 Credentials tab: Card per source (Qobuz, Tidal, Amazon, YTMusic) with status badge, textarea for credentials, Save/Remove buttons, help text with DevTools instructions
- [x] 6.3 Quality tab: Global quality select + per-source override selects (populated from quality constants)
- [x] 6.4 About tab: DMCA notice, version, GitHub link
- [x] 6.5 Add Settings button to `Navbar.tsx` opening SettingsPanel in a dialog/sheet

## 7. Download Resources UI in Results

- [x] 7.1 Update `src/components/ResultsTabs.tsx` to add "Download" tab alongside existing tabs
- [x] 7.2 Create `DownloadResourcesTab.tsx` component showing expandable list per result
- [x] 7.3 Each source entry: quality badge (kind-colored), auth status (lock/connected), effective quality label, download button
- [x] 7.4 Download button: reads credentials from localStorage, calls `/api/download/{source}`, handles loading/error states, shows toast on completion
- [x] 7.5 Pass download resources from search results to ResultsTabs via props

## 8. Footer DMCA Notice

- [x] 8.1 Update `src/app/globals.css` to add DMCA notice text in footer
- [x] 8.2 Update `src/components/Footer.tsx` to render the notice

## 9. Testing & Polish

- [x] 9.1 Add unit tests for `credentials.ts` and `quality.ts` helpers
- [ ] 9.2 Add integration test for download API route (mock provider)
- [ ] 9.3 Test full flow: search → expand download → enter credentials → download
- [x] 9.4 Verify localStorage persistence across page reloads
- [x] 9.5 Run `npm run build` and `npm test` — all pass
- [ ] 9.6 Manual QA: each source downloads correctly at selected quality