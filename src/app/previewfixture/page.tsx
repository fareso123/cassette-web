'use client';

/**
 * TEMPORARY — visual-diff fixture, not part of the app.
 *
 * There is no reachable Postgres and no yt-dlp binary in this environment, so
 * /api/search always returns zero results and the result cards can never be
 * rendered through the real path. This route mounts ResultsTabs with fixed
 * data so the ResultCard surface can be screenshotted before and after the
 * daisyUI -> shadcn migration and compared directly.
 *
 * DELETE before this branch merges.
 */

import { ResultsTabs } from '@/components/ResultsTabs';
import type { ExtractedTrack } from '@/types/extracted';
import type { ScrapedResult } from '@/types/scraped';

const ytDlpResults: ExtractedTrack[] = [
  {
    title: 'Around the World',
    artist: 'Daft Punk',
    directAudioUrl: 'https://example.invalid/audio/around-the-world.mp3',
    webpageUrl: 'https://youtube.com/watch?v=dI8uIcp-8x0',
    thumbnail: '',
    duration: 429,
    formatId: '251',
    extractor: 'youtube',
  },
  {
    // Empty directAudioUrl exercises the "no download available" branch.
    title: 'A Very Long Title That Has To Wrap Because Somebody Typed An Excessive Amount Of Text Into The Title Field Of A Track Listing Somewhere',
    artist: 'Some Artist With An Equally Unreasonable Name',
    directAudioUrl: '',
    webpageUrl: 'https://youtube.com/watch?v=long',
    thumbnail: '',
    duration: 3725,
    formatId: '140',
    extractor: 'youtube',
  },
];

const scraperResults: ScrapedResult[] = [
  {
    title: 'Around the World (Radio Edit)',
    artist: 'Daft Punk',
    sourceSite: 'music-sites',
    downloadUrl: 'https://example.invalid/dl/atw-radio.mp3',
    scraperName: 'music-sites',
  },
  {
    title: 'No Download Available Case',
    artist: 'Torrent Source',
    sourceSite: 'torrent-sites',
    downloadUrl: '',
    scraperName: 'torrent-sites',
  },
];

export default function ResultsPreview() {
  const results = [...ytDlpResults, ...scraperResults];

  return (
    <div className="paper-grain">
      <ResultsTabs
        results={results}
        ytDlpResults={ytDlpResults}
        scraperResults={scraperResults}
      />
    </div>
  );
}
