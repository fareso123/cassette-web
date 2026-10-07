/**
 * Seed the `scrapers` table.
 *
 * The registry loads sources from the database at first use, so with an
 * empty table song search returns nothing at all. This inserts the
 * default sources with their CSS selectors.
 *
 * Idempotent: re-running updates the existing rows by name rather than
 * duplicating them.
 *
 * Usage: npm run db:seed   (runs with bun, which loads .env automatically)
 */

import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { scrapers } from '../src/lib/db/schema';

interface SeedRow {
  name: string;
  baseUrl: string;
  rateLimitMs: number;
  selectors: Record<string, string>;
}

/**
 * Selector sets for each source. These are the shapes BaseScraper.parse
 * understands: a result container, a title, an artist, and a link.
 * Verify these against the live sites; they break when a site redesigns.
 */
const SEEDS: SeedRow[] = [
  {
    name: 'music-sites',
    baseUrl: 'https://zaycev.net',
    rateLimitMs: 1500,
    selectors: {
      container: '.item',
      title: '.track-name a',
      artist: '.track-artist',
      link: '.track-name a',
    },
  },
  {
    name: 'torrent-sites',
    baseUrl: 'https://1337x.to',
    rateLimitMs: 2000,
    selectors: {
      container: '.table-list tbody tr',
      title: '.coll-1.name a',
      artist: '.coll-2 a',
      link: '.coll-1.name a',
    },
  },
  {
    name: 'soundcloud',
    baseUrl: 'https://soundcloud.com',
    rateLimitMs: 1500,
    selectors: {
      container: '.searchResults__items > li',
      title: '.soundTitle__title',
      artist: '.soundTitle__username',
      link: 'a',
    },
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env first.');
    process.exit(1);
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle({ client });

  try {
    for (const seed of SEEDS) {
      const existing = await db
        .select({ id: scrapers.id })
        .from(scrapers)
        .where(eq(scrapers.name, seed.name));

      if (existing.length > 0) {
        await db
          .update(scrapers)
          .set({
            baseUrl: seed.baseUrl,
            rateLimitMs: seed.rateLimitMs,
            selectorsJson: seed.selectors,
            enabled: true,
            updatedAt: new Date(),
          })
          .where(eq(scrapers.name, seed.name));
        console.log(`updated  ${seed.name}`);
      } else {
        await db.insert(scrapers).values({
          name: seed.name,
          baseUrl: seed.baseUrl,
          rateLimitMs: seed.rateLimitMs,
          selectorsJson: seed.selectors,
          enabled: true,
        });
        console.log(`inserted ${seed.name}`);
      }
    }

    console.log(`\nSeeded ${SEEDS.length} scrapers.`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
