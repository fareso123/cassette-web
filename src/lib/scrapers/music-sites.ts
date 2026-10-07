import { BaseScraper } from './base';
import type { ScraperConfig, ScrapedResult } from '../../types/scraped';

export class MusicSitesScraper extends BaseScraper {
  constructor(config: ScraperConfig) {
    super(
      'music-sites',
      config.baseUrl,
      config.selectors,
      config.rateLimitMs,
      config.enabled
    );
  }

  async search(query: string): Promise<ScrapedResult[]> {
    try {
      const searchUrl = `${this.baseUrl}/search/${encodeURIComponent(query)}/`;
      const html = await this.fetch(searchUrl);
      const results = this.parse(html, this.selectors);
      return results;
    } catch (error) {
      console.error(`Error in ${this.name} search:`, error);
      return [];
    }
  }
}
