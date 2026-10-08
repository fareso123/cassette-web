'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ResultsTabs } from '@/components/ResultsTabs';
import { HeroSection } from '@/components/HeroSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ExtractedTrack } from '@/types/extracted';
import type { ScrapedResult } from '@/types/scraped';

interface RecentSearch {
  query: string;
  type: 'song' | 'url';
  timestamp: string;
}

const STORAGE_KEY = 'recentSearches';
const MAX_RECENT = 5;

/*
 * Pinned locale and timeZone. An undefined locale resolves to the server's
 * locale during SSR and the browser's locale on the client, so the same
 * timestamp rendered two different strings and React threw a hydration
 * mismatch on every load. Formatting is a pure function of the value now, so
 * both renders agree.
 */
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

function readRecent(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is RecentSearch =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as RecentSearch).query === 'string' &&
        (entry as RecentSearch).type !== undefined
    );
  } catch {
    return [];
  }
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'song' | 'url'>('song');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(ExtractedTrack | ScrapedResult)[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() =>
    readRecent()
  );
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), type }),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || `Search failed (${response.status})`);
      }

      const data = await response.json();
      setResults(data.results || []);
      setAuthenticated(Boolean(data.authenticated));
      saveToRecent(query.trim(), type);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
      setError(
        err instanceof Error
          ? err.message
          : 'Search failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function saveToRecent(q: string, t: 'song' | 'url') {
    if (typeof window === 'undefined') return;
    const searches = readRecent();
    const updated = [
      { query: q, type: t, timestamp: new Date().toISOString() },
      ...searches.filter(s => s.query !== q),
    ].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setRecentSearches(updated);
  }

  const ytDlpResults = results.filter(
    (r): r is ExtractedTrack => 'directAudioUrl' in r
  );
  const scraperResults = results.filter(
    (r): r is ScrapedResult => !('directAudioUrl' in r)
  );

  return (
    <div>
      <HeroSection />

      {/* Search section */}
      <section
        className="border-border bg-background font-mono border-y"
        aria-labelledby="search-heading"
      >
        <div className="text-muted-foreground flex items-center gap-3 px-6 py-2 text-[10px] tracking-[0.2em]">
          <span id="search-heading">Search module</span>
          <span className="opacity-40">·</span>
          <span>HF-S 800</span>
          {/* Reflects whether the response carried a valid session */}
          <span className="ml-auto">{authenticated ? 'Signed in' : 'Guest'}</span>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <SearchBar
              query={query}
              type={type}
              loading={loading}
              onQueryChange={setQuery}
              onTypeChange={setType}
              onSubmit={handleSubmit}
            />

            {/* Errors inline, with the status announced */}
            {error ? (
              <Alert
                variant="destructive"
                role="alert"
                aria-live="polite"
                className="mt-3"
              >
                <AlertDescription className="text-[0.7rem] tracking-widest">
                  {error}
                </AlertDescription>
              </Alert>
            ) : null}

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <nav className="mt-6" aria-labelledby="recent-heading">
                <div className="text-muted-foreground mb-3 flex items-center gap-3 text-[10px] tracking-[0.2em]">
                  <span id="recent-heading">Recent searches</span>
                  <span className="h-px flex-1 bg-current opacity-20" />
                  <span className="tabular-nums">
                    {recentSearches.length} entries
                  </span>
                </div>
                <ul className="list-none space-y-1 p-0">
                  {recentSearches.map(search => (
                    <li key={search.query}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(search.query);
                          setType(search.type);
                          setError(null);
                        }}
                        className="hover:bg-muted focus-visible:ring-ring flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                      >
                        <span className="min-w-0 truncate">{search.query}</span>
                        <span className="text-muted-foreground shrink-0">
                          {search.type === 'url' ? 'YouTube' : 'Song'} ·{' '}
                          <time dateTime={search.timestamp}>
                            {dateFormatter.format(new Date(search.timestamp))}
                          </time>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </section>

      {/* Results section */}
      <section
        className="border-border bg-background font-mono border-t"
        aria-labelledby="results-heading"
      >
        <div className="text-muted-foreground flex items-center gap-3 px-6 py-2 text-[10px] tracking-[0.2em]">
          <span id="results-heading">Results</span>
          <span className="opacity-40">·</span>
          {/* Status region: announces "N results" as searches complete */}
          <p role="status" aria-live="polite" className="tabular-nums">
            {loading
              ? 'Searching…'
              : `${results.length} ${results.length === 1 ? 'result' : 'results'}`}
          </p>
        </div>
        <ResultsTabs
          results={results}
          ytDlpResults={ytDlpResults}
          scraperResults={scraperResults}
          loading={loading}
        />
      </section>
    </div>
  );
}
