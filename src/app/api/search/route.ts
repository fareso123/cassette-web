import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '../../../lib/rate-limit';
import { parseYouTubeUrl } from '../../../lib/utils/youtube';
import { extract } from '../../../lib/extractors/yt-dlp';
import { scraperRegistry } from '../../../lib/scrapers/registry';
import { validateSession } from '../../../lib/session';
import { recordSearch } from '../../../lib/search-history';
import type { ScrapedResult } from '../../../types/scraped';
import type { SearchResponse } from '../../../types/search';

/** Anonymous callers share a per-IP budget. */
const ANON_WINDOW_MS = 60_000;
const ANON_MAX = 100;

/** A signed-in user gets their own, larger budget. */
const USER_WINDOW_MS = 60_000;
const USER_MAX = 500;

export async function POST(request: NextRequest): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // Optional session: an absent or invalid token simply means anonymous.
  // This endpoint is intentionally not gated on auth; see AGENTS.md.
  const { valid, session } = await validateSession(request, ip);

  const rateLimitResult = valid
    ? await checkRateLimit(`user:${session?.userId}`, USER_WINDOW_MS, USER_MAX)
    : await checkRateLimit(`anon:${ip}`, ANON_WINDOW_MS, ANON_MAX);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.reset,
      },
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
    };

    if (type === 'url') {
      const urlInfo = parseYouTubeUrl(query);
      if (!urlInfo.videoId && !urlInfo.playlistId) {
        return NextResponse.json(
          { error: 'Invalid YouTube URL' },
          { status: 400 }
        );
      }

      const tracks = await extract(query);
      response.source = 'yt-dlp';
      response.results = tracks;
      response.resultCount = tracks.length;
    } else {
      const scrapers = await scraperRegistry.getEnabled();
      const settled = await Promise.allSettled(
        scrapers.map(s => s.search(query))
      );

      const allResults = settled
        .filter(
          (r): r is PromiseFulfilledResult<ScrapedResult[]> =>
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
    }

    // Only a signed-in user's history is persisted. Anonymous searches stay
    // out of the table so it cannot fill up with unassociated rows.
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
