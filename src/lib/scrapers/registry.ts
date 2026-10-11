import type {
  ScraperModule,
  ScraperConfig,
  ScraperRegistry,
} from '../../types/scraped';
import type { DownloadProvider } from '../../types/download';
import { BaseScraper, hasDownloadProvider } from './base';
import { TorrentSitesScraper } from './torrent-sites';
import { MusicSitesScraper } from './music-sites';
import { SoundCloudScraper } from './soundcloud';
import { FreeMusicArchiveScraper } from './freemusicarchive';
import { IntMusicScraper } from './intmusic';
import { qobuzScraper } from './qobuz';
import { tidalScraper } from './tidal';
import { amazonScraper } from './amazon';
import { ytmusicScraper } from './ytmusic';
import { scrapers as scrapersTable } from '../../lib/db/schema';
import { db } from '../../lib/db';
import { eq } from 'drizzle-orm';
class ScraperRegistryImpl implements ScraperRegistry {
  private scrapers: Map<string, ScraperModule> = new Map();
  private downloadProviders: Map<string, DownloadProvider> = new Map();
  private initialized = false;

  register(scraper: ScraperModule): void {
    this.scrapers.set(scraper.name, scraper);
    if (hasDownloadProvider(scraper)) {
      this.downloadProviders.set(scraper.name, scraper);
    }
  }

  getByName(name: string): ScraperModule | undefined {
    return this.scrapers.get(name);
  }

  getAll(): ScraperModule[] {
    return Array.from(this.scrapers.values());
  }

  getEnabled(): Promise<ScraperModule[]> {
    if (!this.initialized) {
      this.initialize();
      this.initialized = true;
    }
    return Promise.resolve(this.getAll().filter((s) => {
      const base = s as unknown as BaseScraper;
      return base.enabled;
    }));
  }

  getDownloadProvider(sourceId: string): DownloadProvider | undefined {
    if (!this.initialized) {
      this.initialize();
      this.initialized = true;
    }
    return this.downloadProviders.get(sourceId);
  }

  getAllDownloadProviders(): DownloadProvider[] {
    if (!this.initialized) {
      this.initialize();
      this.initialized = true;
    }
    return Array.from(this.downloadProviders.values());
  }

  private initialize(): void {
    // Register built-in scrapers
    this.register(qobuzScraper);
    this.register(tidalScraper);
    this.register(amazonScraper);
    this.register(ytmusicScraper);
    this.register(new TorrentSitesScraper({ name: 'torrent-sites', baseUrl: '', enabled: true, rateLimitMs: 1000, selectors: {} }));
    this.register(new MusicSitesScraper({ name: 'music-sites', baseUrl: '', enabled: true, rateLimitMs: 1000, selectors: {} }));
    this.register(new FreeMusicArchiveScraper({ name: 'freemusicarchive', baseUrl: '', enabled: true, rateLimitMs: 1500, selectors: {} }));
    this.register(new IntMusicScraper({ name: 'intmusic', baseUrl: '', enabled: true, rateLimitMs: 2000, selectors: {} }));

    // Load from database
    this.loadFromDatabase().catch(console.error);
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
          if (hasDownloadProvider(scraper)) {
            this.downloadProviders.set(scraper.name, scraper);
          }
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
      case 'freemusicarchive':
        return new FreeMusicArchiveScraper(config);
      case 'intmusic':
        return new IntMusicScraper(config);
      case 'soundcloud':
        return new SoundCloudScraper(config);
      default:
        return null;
    }
  }
}

export const scraperRegistry = new ScraperRegistryImpl();