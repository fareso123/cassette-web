import type { ExtractedTrack } from './extracted';
import type { ScrapedResult } from './scraped';

export interface SearchRequest {
  query: string;
  type: 'song' | 'url';
}

export interface SearchResponse {
  source: 'yt-dlp' | 'scrapers';
  results: ExtractedTrack[] | ScrapedResult[];
  query: string;
  queryType: 'song' | 'url';
  resultCount: number;
  timestamp: string;
}

export type SearchResult = ExtractedTrack | ScrapedResult;
