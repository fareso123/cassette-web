import type {
  ScraperModule,
  ScraperConfig,
  ScraperRegistry,
} from '../../types/scraped';
import { BaseScraper } from './base';
import { TorrentSitesScraper } from './torrent-sites';
import { MusicSitesScraper } from './music-sites';
import { SoundCloudScraper } from './soundcloud';
import { scrapers as scrapersTable } from '../../lib/db/schema';
import { db } from '../../lib/db';
import { eq } from 'drizzle-orm';

class ScraperRegistryImpl implements ScraperRegistry {
  private scrapers: Map<string, ScraperModule> = new Map();
  private initialized = false;

  register(scraper: ScraperModule): void {
    this.scrapers.set(scraper.name, scraper);
  }

  getByName(name: string): ScraperModule | undefined {
    return this.scrapers.get(name);
  }

  getAll(): ScraperModule[] {
    return Array.from(this.scrapers.values());
  }

  async getEnabled(): Promise<ScraperModule[]> {
    if (!this.initialized) {
      await this.loadFromDatabase();
      this.initialized = true;
    }
    return this.getAll().filter(s => {
      const base = s as unknown as BaseScraper;
      return base.enabled;
    });
  }

  private async loadFromDatabase(): Promise<void> {
    try {
      const dbScrapers = await db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.enabled, true));
      for (const scraperConfig of dbScrapers) {
        const config: ScraperConfig = {
          name: scraperConfig.name,
          baseUrl: scraperConfig.baseUrl,
          enabled: scraperConfig.enabled,
          rateLimitMs: scraperConfig.rateLimitMs,
          selectors: scraperConfig.selectorsJson,
        };
        const scraper = this.createScraperFromConfig(config);
        if (scraper) {
          this.scrapers.set(scraper.name, scraper);
        }
      }
    } catch (error) {
      console.error('Failed to load scrapers from database:', error);
    }
  }

  private createScraperFromConfig(config: ScraperConfig): ScraperModule | null {
    switch (config.name) {
      case 'torrent-sites':
        return new TorrentSitesScraper(config);
      case 'music-sites':
        return new MusicSitesScraper(config);
      case 'soundcloud':
        return new SoundCloudScraper(config);
      default:
        return null;
    }
  }
}

export const scraperRegistry = new ScraperRegistryImpl();