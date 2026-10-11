import * as cheerio from 'cheerio';
import { BaseScraper } from './base';
import type { ScraperConfig, ScrapedResult } from '../../types/scraped';

export class FreeMusicArchiveScraper extends BaseScraper {
  constructor(config: ScraperConfig) {
    super(
      'freemusicarchive',
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
      return this.parseFreeMusicArchive(html);
    } catch (error) {
      console.error(`Error in ${this.name} search:`, error);
      return [];
    }
  }

  private parseFreeMusicArchive(html: string): ScrapedResult[] {
    const $ = cheerio.load(html);
    const results: ScrapedResult[] = [];

    $('.js-download').each((_, element) => {
      const $btn = $(element);
      const downloadOverlayUrl = $btn.attr('data-url');
      if (!downloadOverlayUrl) return;

      const $controlsSpan = $btn.closest('span.absolute.inline-flex');
      if (!$controlsSpan.length) return;

      const $row = $controlsSpan.parent();
      if (!$row.length) return;

      const title = $row.find('.ptxt-track a.font-bold').text().trim();
      const artist = $row.find('.ptxt-artist a.font-\\[500\\]').text().trim();
      const album = $row.find('.ptxt-album a').text().trim();
      const genre = $row.find('.ptxt-genre a').first().text().trim();
      const duration = $row.find('.inline-flex.items-center.col-span-1').text().trim();

      if (!title || !artist) return;

      const directUrl = downloadOverlayUrl;

      results.push({
        title,
        artist,
        sourceSite: 'Free Music Archive',
        downloadUrl: directUrl,
        quality: duration || genre,
        size: album,
        scraperName: this.name,
      });
    });

    return results;
  }

  parse(html: string, _selectors: Record<string, string>): ScrapedResult[] {
    return this.parseFreeMusicArchive(html);
  }
}