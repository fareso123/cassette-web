import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '../../../lib/rate-limit';
import { extractSearchYouTube, extractYouTubeUrl } from '@/lib/extractors/youtubei-client';
import { scraperRegistry } from '../../../lib/scrapers/registry';
import { validateSession } from '../../../lib/session';
import { recordSearch } from '../../../lib/search-history';
import type { ScrapedResult } from '../../../types/scraped';
import type { ExtractedTrack } from '../../../types/extracted';
import type { SearchResponse } from '../../../types/search';
import { hasDownloadProvider } from '@/lib/scrapers/base';

/** Anonymous callers share a per-IP budget. */
const ANON_WINDOW_MS = 60_000;
const ANON_MAX = 100;

/** A signed-in user gets their own, larger budget. */
const USER_WINDOW_MS = 60_000;
const USER_MAX = 500;

export async function POST(request: NextRequest): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const { valid, session } = await validateSession(request, ip);

  const rateLimitResult = valid
    ? await checkRateLimit(`user:${session?.userId}`, USER_WINDOW_MS, USER_MAX)
    : await checkRateLimit(`anon:${ip}`, ANON_WINDOW_MS, ANON_MAX);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: rateLimitResult.reset },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { query, type } = body as { query: string; type: 'song' | 'url' };

    if (!query || !type) {
      return NextResponse.json(
        { error: 'Missing query or type' },
        { status: 400 }
      );
    }

    const response: SearchResponse = {
      source: 'scrapers',
      results: [],
      query,
      queryType: type,
      resultCount: 0,
      timestamp: new Date().toISOString(),
      authenticated: valid,
      downloadResources: {},
    };

    if (type === 'url') {
      const tracks = await extractYouTubeUrl(query);
      if (tracks.length === 0) {
        return NextResponse.json(
          { error: 'Could not extract audio from URL' },
          { status: 400 }
        );
      }
      response.source = 'youtubei';
      response.results = tracks;
      response.resultCount = tracks.length;
    } else {
      // YouTube search first, then scrapers as fallback
      const tracks = await extractSearchYouTube(query, 10);

      if (tracks.length > 0) {
        response.source = 'youtubei';
        response.results = tracks;
        response.resultCount = tracks.length;
      } else {
        // Fallback to scrapers
        const scrapers = await scraperRegistry.getEnabled();
        const settled = await Promise.allSettled(
          scrapers.map(s => s.search(query))
        );

        const allResults = settled
          .filter((r): r is PromiseFulfilledResult<ScrapedResult[]> =>
            r.status === 'fulfilled'
          )
          .flatMap(r => r.value);

        const seen = new Set<string>();
        const deduped = allResults.filter(r => {
          if (seen.has(r.downloadUrl)) return false;
          seen.add(r.downloadUrl);
          return true;
        });

        response.results = deduped;
        response.resultCount = deduped.length;

        // Fetch download resources for each result
        const downloadResources: Record<string, any[]> = {};
        for (let i = 0; i < deduped.length; i++) {
          const track = deduped[i];
          const scraper = scraperRegistry.getByName(track.scraperName);
          if (scraper && hasDownloadProvider(scraper)) {
            try {
              const resources = await scraper.getDownloadResources(track);
              if (resources.length > 0) {
                downloadResources[i.toString()] = resources;
              }
            } catch (err) {
              console.error(`Download resources error for ${track.scraperName}:`, err);
            }
          }
        }
        if (Object.keys(downloadResources).length > 0) {
          response.downloadResources = downloadResources;
        }
      }
    }

    if (valid && session) {
      await recordSearch(session.userId, query, type, response.resultCount);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}