import * as cheerio from 'cheerio';
import { BaseScraper } from './base';
import type { ScraperConfig, ScrapedResult } from '../../types/scraped';

export class IntMusicScraper extends BaseScraper {
  constructor(config: ScraperConfig) {
    super(
      'intmusic',
      config.baseUrl,
      config.selectors,
      config.rateLimitMs,
      config.enabled
    );
  }

  private parseIntMusic(html: string): ScrapedResult[] {
    const $ = cheerio.load(html);
    const results: ScrapedResult[] = [];

    $('h2.entry-title, .post-title, h2 a, .entry-title a').each((_, element) => {
      const $link = $(element);
      const postUrl = $link.attr('href');
      const title = $link.text().trim();

      if (!postUrl || !title) return;

      const $container = $link.closest('article, .post, .post-item, .entry');
      let artist = '';
      let size = '';

      if ($container.length) {
        const text = $container.text();
        const artistMatch = text.match(/by\s+([^\n]+)/i) || text.match(/artist[:\s]+([^\n]+)/i);
        if (artistMatch) {
          artist = artistMatch[1].trim();
        }
        const sizeMatch = text.match(/(\d+\s*(?:MB|GB))/i);
        if (sizeMatch) {
          size = sizeMatch[1];
        }
      }

      const dashIndex = title.indexOf('–') >= 0 ? title.indexOf('–') : title.indexOf('-');
      if (dashIndex > 0) {
        artist = title.substring(0, dashIndex).trim();
      }

      results.push({
        title,
        artist,
        sourceSite: 'IntMusic',
        downloadUrl: postUrl,
        quality: size,
        size,
        scraperName: this.name,
      });
    });

    return results;
  }

  async enrichWithDownloadLinks(results: ScrapedResult[], maxToFetch: number = 5): Promise<ScrapedResult[]> {
    for (let i = 0; i < Math.min(results.length, maxToFetch); i++) {
      const result = results[i];
      try {
        const postHtml = await this.fetch(result.downloadUrl);
        const $ = cheerio.load(postHtml);

        const downloadLinks: string[] = [];
        $('a[href*="/url/"], a[href*="download"]').each((_, link) => {
          const href = $(link).attr('href');
          if (href) downloadLinks.push(href);
        });

        if (downloadLinks.length > 0) {
          result.downloadUrl = downloadLinks[0];
        }
      } catch (error) {
        console.error(`Error fetching post ${result.downloadUrl}:`, error);
      }
    }
    return results;
  }

  async search(query: string): Promise<ScrapedResult[]> {
    try {
      const searchUrl = `${this.baseUrl}/?s=${encodeURIComponent(query)}`;
      const html = await this.fetch(searchUrl);
      const results = this.parseIntMusic(html);
      return this.enrichWithDownloadLinks(results, 5);
    } catch (error) {
      console.error(`Error in ${this.name} search:`, error);
      return [];
    }
  }

  parse(html: string, _selectors: Record<string, string>): ScrapedResult[] {
    return this.parseIntMusic(html);
  }
}