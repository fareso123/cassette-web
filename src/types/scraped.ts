export interface ScrapedResult {
  title: string;
  artist: string;
  sourceSite: string;
  downloadUrl: string;
  quality?: string;
  size?: string;
  scraperName: string;
}

export interface ScraperConfig {
  name: string;
  baseUrl: string;
  enabled: boolean;
  rateLimitMs: number;
  selectors: Record<string, string>;
}

export interface Scraper {
  name: string;
  search(query: string): Promise<ScrapedResult[]>;
  fetch(url: string, options?: RequestInit): Promise<string>;
  parse(html: string, selectors: Record<string, string>): ScrapedResult[];
}
