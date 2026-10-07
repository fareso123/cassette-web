import * as cheerio from 'cheerio';
import type { ScraperModule, ScrapedResult } from '../../types/scraped';

export class BaseScraper implements ScraperModule {
  name: string;
  baseUrl: string;
  rateLimitMs: number;
  selectors: Record<string, string>;
  enabled: boolean;

  private lastRequestTime: number = 0;

  constructor(
    name: string,
    baseUrl: string,
    selectors: Record<string, string> = {},
    rateLimitMs: number = 1000,
    enabled: boolean = true
  ) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.selectors = selectors;
    this.rateLimitMs = rateLimitMs;
    this.enabled = enabled;
  }

  async fetch(url: string, options: RequestInit = {}): Promise<string> {
    await this.enforceRateLimit();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitMs) {
      await new Promise(resolve =>
        setTimeout(resolve, this.rateLimitMs - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  parse(html: string, selectors: Record<string, string>): ScrapedResult[] {
    const $ = cheerio.load(html);
    const results: ScrapedResult[] = [];

    const containerSelector =
      selectors.container || '.result, .item, .track, li';
    const titleSelector = selectors.title || 'h3, .title, .name, a';
    const artistSelector =
      selectors.artist || '.artist, .author, .uploader, [class*="artist"]';
    const linkSelector = selectors.link || 'a[href]';

    $(containerSelector).each((_, element) => {
      const $el = $(element);
      const title =
        $el.find(titleSelector).first().text().trim() ||
        $el.find('a').first().text().trim();
      const artist = $el.find(artistSelector).first().text().trim();
      const link = $el.find(linkSelector).first().attr('href');

      if (title && link) {
        results.push({
          title,
          artist: artist || 'Unknown',
          sourceSite: this.baseUrl,
          downloadUrl: this.resolveUrl(link),
          scraperName: this.name,
        });
      }
    });

    return results;
  }

  resolveUrl(url: string): string {
    if (url.startsWith('http') || url.startsWith('magnet:')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return new URL(url, this.baseUrl).href;
    return new URL(url, this.baseUrl).href;
  }

  async search(_query: string): Promise<ScrapedResult[]> {
    throw new Error('search() must be implemented by subclass');
  }
}
