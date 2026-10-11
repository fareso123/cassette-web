import type { ExtractedTrack } from './extracted';
import type { ScrapedResult } from './scraped';

export interface SearchRequest {
  query: string;
  type: 'song' | 'url';
}

export interface SearchResponse {
  source: 'yt-dlp' | 'youtubei' | 'scrapers';
  results: ExtractedTrack[] | ScrapedResult[];
  query: string;
  queryType: 'song' | 'url';
  resultCount: number;
  timestamp: string;
  /** True when the request carried a valid session token. */
  authenticated: boolean;
}

export type SearchResult = ExtractedTrack | ScrapedResult;
