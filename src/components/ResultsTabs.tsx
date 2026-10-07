'use client';

import { useId, useRef, useState } from 'react';
import type { ExtractedTrack } from '@/types/extracted';
import type { ScrapedResult } from '@/types/scraped';
import { ResultCard } from './ResultCard';

interface ResultsTabsProps {
  results: (ExtractedTrack | ScrapedResult)[];
  ytDlpResults: ExtractedTrack[];
  scraperResults: ScrapedResult[];
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

export function ResultsTabs({
  results,
  ytDlpResults,
  scraperResults,
}: ResultsTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = [
    { label: 'All', results: results },
    { label: 'YouTube', results: ytDlpResults },
    { label: 'Scrapers', results: scraperResults },
  ];

  const active = tabs[activeTab] ?? tabs[0];
  const isEmpty = active.results.length === 0;

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    let next: number | null = null;

    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;

    if (next === null) return;
    e.preventDefault();
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="font-mono">
      {/* Tab strip */}
      <div
        role="tablist"
        aria-label="Filter results by source"
        className="border-b border-base-content/20 flex"
      >
        {tabs.map((tab, i) => {
          const selected = activeTab === i;
          return (
            <button
              key={tab.label}
              id={`${baseId}-tab-${i}`}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`flex-1 px-4 py-3 text-[10px] uppercase tracking-widest transition-colors border-r border-base-content/20 last:border-r-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                selected
                  ? 'bg-primary text-primary-content border-b-2 border-primary-content'
                  : 'bg-base-100 text-base-content/60 hover:bg-base-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-[9px] tabular-nums ${
                  selected
                    ? 'bg-primary-content text-primary'
                    : 'bg-base-content/10 text-base-content/70'
                }`}
              >
                {tab.results.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div
        role="tabpanel"
        id={`${baseId}-panel-${activeTab}`}
        aria-labelledby={`${baseId}-tab-${activeTab}`}
        tabIndex={0}
        className="p-4 focus-visible:outline-2 focus-visible:outline-primary"
      >
        {isEmpty ? (
          <div className="text-center py-12 text-base-content/60 uppercase tracking-widest text-xs">
            <p>NO RESULTS FOUND</p>
            <p className="mt-2 normal-case tracking-normal text-base-content/50">
              {activeTab === 0
                ? 'Try a different song title, or paste a YouTube URL instead.'
                : 'No results from this source. Try the All tab.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {active.results.map((result) => (
              <ResultCard key={resultKey(result)} {...toCard(result)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
