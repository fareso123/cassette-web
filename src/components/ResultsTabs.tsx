'use client';

import type { ExtractedTrack } from '@/types/extracted';
import type { ScrapedResult } from '@/types/scraped';
import { Badge } from '@/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ResultCard } from './ResultCard';

interface ResultsTabsProps {
  results: (ExtractedTrack | ScrapedResult)[];
  ytDlpResults: ExtractedTrack[];
  scraperResults: ScrapedResult[];
  loading?: boolean;
}

type Card = React.ComponentProps<typeof ResultCard>;

/**
 * The two result shapes carry their URL under different keys
 * (directAudioUrl + webpageUrl vs. downloadUrl). Normalize here so
 * ResultCard has a single contract, and key off a stable identifier.
 */
function toCard(result: ExtractedTrack | ScrapedResult): Card {
  if ('directAudioUrl' in result) {
    return {
      title: result.title,
      artist: result.artist,
      downloadUrl: result.directAudioUrl || result.webpageUrl,
      source: 'YouTube',
      thumbnail: result.thumbnail,
      duration: result.duration,
    };
  }
  return {
    title: result.title,
    artist: result.artist,
    downloadUrl: result.downloadUrl,
    source: result.sourceSite,
    thumbnail: undefined,
    duration: undefined,
  };
}

function resultKey(result: ExtractedTrack | ScrapedResult): string {
  if ('directAudioUrl' in result) {
    return result.directAudioUrl || result.webpageUrl || result.title;
  }
  return result.downloadUrl || result.title;
}

/**
 * Skeleton placeholders for the results grid. Same two-column shape as the
 * real grid, so the layout does not jump when results land. Six matches the
 * typical page of scraper hits without pretending to know the count.
 */
const SKELETON_COUNT = 6;

function ResultGrid({
  results,
  loading,
}: {
  results: (ExtractedTrack | ScrapedResult)[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-1 gap-3 md:grid-cols-2"
        aria-hidden="true"
      >
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div
            key={i}
            className="border-border bg-card flex h-44 flex-col gap-3 border p-4"
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-auto h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {results.map(result => (
        <ResultCard key={resultKey(result)} {...toCard(result)} />
      ))}
    </div>
  );
}

export function ResultsTabs({
  results,
  ytDlpResults,
  scraperResults,
  loading = false,
}: ResultsTabsProps) {
  const tabs = [
    { value: 'all', label: 'All', results: results },
    { value: 'youtube', label: 'YouTube', results: ytDlpResults },
    { value: 'scrapers', label: 'Scrapers', results: scraperResults },
  ];

  return (
    <div className="font-mono">
      <Tabs defaultValue="all" className="gap-0">
        <TabsList
          variant="line"
          className="border-border w-full justify-stretch border-b p-0"
        >
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="border-border text-muted-foreground hover:text-foreground flex-1 border-r px-4 py-3 text-[10px] tracking-widest last:border-r-0 data-active:border-foreground data-active:text-foreground data-active:after:hidden"
            >
              <span>{tab.label}</span>
              <Badge
                variant="secondary"
                className="ml-2 h-5 min-w-5 justify-center px-1 text-[9px] tabular-nums"
              >
                {tab.results.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="p-4">
            {!loading && tab.results.length === 0 ? (
              <Empty className="py-12">
                <EmptyHeader>
                  <EmptyTitle className="text-xs tracking-widest">
                    No results found
                  </EmptyTitle>
                  <EmptyDescription className="text-muted-foreground normal-case tracking-normal">
                    {tab.value === 'all'
                      ? 'Try a different song title, or paste a YouTube URL instead.'
                      : 'No results from this source. Try the All tab.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ResultGrid results={tab.results} loading={loading} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
