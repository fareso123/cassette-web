import type { ScrapedResult, ScraperConfig } from '../../types/scraped';

export interface ScraperModule {
  name: string;
  search(query: string): Promise<ScrapedResult[]>;
  fetch(url: string, options?: RequestInit): Promise<string>;
  parse(html: string, selectors: Record<string, string>): ScrapedResult[];
}

export interface ScraperRegistry {
  register(scraper: ScraperModule): void;
  getEnabled(): Promise<ScraperModule[]>;
  getByName(name: string): ScraperModule | undefined;
  getAll(): ScraperModule[];
}

export const DEFAULT_CONFIG: ScraperConfig = {
  name: 'base',
  baseUrl: '',
  enabled: true,
  rateLimitMs: 1000,
  selectors: {},
};
