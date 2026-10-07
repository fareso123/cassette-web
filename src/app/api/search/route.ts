import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '../../../lib/rate-limit';
import { parseYouTubeUrl } from '../../../lib/utils/youtube';
import { extract } from '../../../lib/extractors/yt-dlp';
import { scraperRegistry } from '../../../lib/scrapers/registry';
import type { ScrapedResult } from '../../../types/scraped';
import type { SearchResponse } from '../../../types/search';

export async function POST(request: NextRequest): Promise<Response> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = await checkRateLimit(`search:${ip}`, 60000, 100);

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

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
