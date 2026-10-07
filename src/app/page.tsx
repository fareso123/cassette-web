'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ResultsTabs } from '@/components/ResultsTabs';
import { HeroSection } from '@/components/HeroSection';
import type { ExtractedTrack } from '@/types/extracted';
import type { ScrapedResult } from '@/types/scraped';

interface RecentSearch {
  query: string;
  type: 'song' | 'url';
  timestamp: string;
}

const STORAGE_KEY = 'recentSearches';

export default function Home() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'song' | 'url'>('song');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(ExtractedTrack | ScrapedResult)[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    try {
      setRecentSearches(stored ? (JSON.parse(stored) as RecentSearch[]) : []);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), type }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      saveToRecent(query, type);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function saveToRecent(q: string, t: 'song' | 'url') {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const searches: RecentSearch[] = stored ? JSON.parse(stored) : [];
    const exists = searches.some((s) => s.query === q);
    const updated = exists
      ? searches.filter((s) => s.query !== q)
      : [{ query: q, type: t, timestamp: new Date().toISOString() }, ...searches].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setRecentSearches(updated);
  }

  const ytDlpResults = results.filter(
    (r): r is ExtractedTrack => r !== null && typeof r === 'object' && 'directAudioUrl' in r
  );
  const scraperResults = results.filter(
    (r): r is ScrapedResult => r !== null && typeof r === 'object' && !('directAudioUrl' in r)
  );

  return (
    <div className="paper-grain">
      <HeroSection />

      {/* Search section */}
      <section className="border-y border-base-content/20 bg-base-100">
        <div
          className="px-6 py-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-base-content/40"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span>SEARCH MODULE</span>
          <span className="text-base-content/20">·</span>
          <span>v2.0.1 · HF-S 800</span>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <SearchBar
              query={query}
              type={type}
              loading={loading}
              onQueryChange={setQuery}
              onTypeChange={setType}
              onSubmit={handleSubmit}
            />

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="mt-6">
                <div
                  className="flex items-center gap-3 mb-3 text-[10px] uppercase tracking-[0.2em] text-base-content/40"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  <span>RECENT SEARCHES</span>
                  <span className="flex-1 h-px bg-base-content/20" />
                  <span>{recentSearches.length} ENTRIES</span>
                </div>
                <ul className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider text-base-content/60 hover:text-base-content hover:bg-base-200 cursor-pointer transition-colors"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}
                      onClick={() => {
                        setQuery(search.query);
                        setType(search.type);
                      }}
                    >
                      <span>{search.query}</span>
                      <span className="text-base-content/30">{search.type} · {new Date(search.timestamp).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results section */}
      {results.length > 0 && (
        <section className="border-t border-base-content/20 bg-base-100">
          <div
            className="px-6 py-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-base-content/40"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span>RESULTS</span>
            <span className="text-base-content/20">·</span>
            <span>{results.length} TRACKS FOUND</span>
          </div>
          <ResultsTabs
            results={results}
            ytDlpResults={ytDlpResults}
            scraperResults={scraperResults}
          />
        </section>
      )}
    </div>
  );
}
