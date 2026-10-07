import { BaseScraper } from './base';
import type { ScraperConfig, ScrapedResult } from '../../types/scraped';

export class TorrentSitesScraper extends BaseScraper {
  constructor(config: ScraperConfig) {
    super(
      'torrent-sites',
      config.baseUrl,
      config.selectors,
      config.rateLimitMs,
      config.enabled
    );
  }

  async search(query: string): Promise<ScrapedResult[]> {
    try {
      const searchUrl = `${this.baseUrl}/search/${encodeURIComponent(query)}/1/`;
      const html = await this.fetch(searchUrl);
      const results = this.parse(html, this.selectors);
      return results;
    } catch (error) {
      console.error(`Error in ${this.name} search:`, error);
      return [];
    }
  }
}
