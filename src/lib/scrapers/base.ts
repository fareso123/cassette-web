import * as cheerio from 'cheerio';
import type { ScraperModule, ScrapedResult } from '../../types/scraped';
import type { DownloadProvider, DownloadResource, QualityOption } from '../../types/download';

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
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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
      await new Promise((resolve) =>
        setTimeout(resolve, this.rateLimitMs - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  parse(html: string, selectors: Record<string, string>): ScrapedResult[] {
    const $ = cheerio.load(html);
    const results: ScrapedResult[] = [];

    const itemSelector = selectors.item;
    if (!itemSelector) {
      return results;
    }

    $(itemSelector).each((_, element) => {
      const $el = $(element);

      const title =
        $el.find(selectors.title).first().text().trim() ||
        $el.attr('title') ||
        $el.attr('data-title') ||
        '';
      const artist =
        $el.find(selectors.artist).first().text().trim() ||
        $el.attr('data-artist') ||
        '';
      const downloadUrl =
        $el.find(selectors.downloadUrl).first().attr('href') ||
        $el.attr('href') ||
        $el.find('a').first().attr('href') ||
        '';
      const quality =
        $el.find(selectors.quality).first().text().trim() ||
        $el.attr('data-quality') ||
        '';
      const size =
        $el.find(selectors.size).first().text().trim() ||
        $el.attr('data-size') ||
        '';

      if (title && downloadUrl) {
        results.push({
          title,
          artist,
          sourceSite: this.name,
          downloadUrl: this.resolveUrl(downloadUrl),
          quality,
          size,
          scraperName: this.name,
        });
      }
    });

    return results;
  }

  resolveUrl(url: string): string {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${this.baseUrl}${url}`;
    return `${this.baseUrl}/${url}`;
  }

  async search(_query: string): Promise<ScrapedResult[]> {
    throw new Error('search() must be implemented by subclass');
  }

  // DownloadProvider optional methods - override in subclasses that support downloads
  async getDownloadResources(_track: ScrapedResult): Promise<DownloadResource[]> {
    return [];
  }

  async getDownloadStream(
    _trackId: string,
    _qualityId: string,
    _credentials: Record<string, string>
  ): Promise<ReadableStream<Uint8Array>> {
    throw new Error('Download not supported by this scraper');
  }

  getQualities(): QualityOption[] {
    return [];
  }

  async validateCredentials(_credentials: Record<string, string>): Promise<boolean> {
    return false;
  }
}

// Type guard to check if a scraper implements DownloadProvider
export function hasDownloadProvider(
  scraper: ScraperModule
): scraper is ScraperModule & DownloadProvider {
  return (
    typeof (scraper as ScraperModule & DownloadProvider).getDownloadResources ===
      'function' &&
    typeof (scraper as ScraperModule & DownloadProvider).getDownloadStream ===
      'function'
  );
}