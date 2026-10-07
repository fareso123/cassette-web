'use client';

import { useState } from 'react';
import type { ExtractedTrack } from '@/types/extracted';
import type { ScrapedResult } from '@/types/scraped';
import { ResultCard } from './ResultCard';

interface ResultsTabsProps {
  results: (ExtractedTrack | ScrapedResult)[];
  ytDlpResults: ExtractedTrack[];
  scraperResults: ScrapedResult[];
}

export function ResultsTabs({ results, ytDlpResults, scraperResults }: ResultsTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'ALL', count: results.length },
    { label: 'YOUTUBE', count: ytDlpResults.length },
    { label: 'SCRAPERS', count: scraperResults.length },
  ];

  const activeResults = activeTab === 0 ? results : activeTab === 1 ? ytDlpResults : scraperResults;

  return (
    <div style={{ fontFamily: 'var(--font-mono)' }}>
      {/* Tab strip */}
      <div className="border-b border-base-content/20 flex">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`flex-1 px-4 py-3 text-[10px] uppercase tracking-widest transition-colors border-r border-base-content/20 last:border-r-0 ${
              activeTab === i
                ? 'bg-primary text-primary-content'
                : 'bg-base-100 text-base-content/50 hover:bg-base-200'
            }`}
            style={{ fontSize: '0.65rem' }}
          >
            <span>{tab.label}</span>
            <span
              className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-[9px] ${
                activeTab === i ? 'bg-primary-content/20' : 'bg-base-content/10'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="p-4">
        {activeResults.length === 0 ? (
          <div
            className="text-center py-12 text-base-content/40 uppercase tracking-widest text-xs"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            NO RESULTS FOUND
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeResults.map((result, i) => (
              <ResultCard key={i} {...result} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
