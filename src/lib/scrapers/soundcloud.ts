import { BaseScraper } from './base';
import type { ScraperConfig, ScrapedResult } from '../../types/scraped';

export class SoundCloudScraper extends BaseScraper {
  constructor(config: ScraperConfig) {
    super(
      'soundcloud',
      config.baseUrl,
      config.selectors,
      config.rateLimitMs,
      config.enabled
    );
  }

  async search(query: string): Promise<ScrapedResult[]> {
    try {
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
      const html = await this.fetch(searchUrl);
      const results = this.parse(html, this.selectors);
      return results;
    } catch (error) {
      console.error(`Error in ${this.name} search:`, error);
      return [];
    }
  }
}
