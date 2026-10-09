'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ResultsTabs } from '@/components/ResultsTabs';
import { HeroSection } from '@/components/HeroSection';
import { PlayerPanel } from '@/components/PlayerPanel';
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
  const [selected, setSelected] = useState<ExtractedTrack | ScrapedResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSelected(null);
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
    <div className="mx-auto flex w-full max-w-5xl items-start gap-6 px-4 pb-12 pt-6">
      {/* Left: compact player panel — opens when a result is clicked */}
      {selected ? (
        <div className="w-72 shrink-0">
          <PlayerPanel
            title={selected.title}
            artist={
              'directAudioUrl' in selected ? selected.artist : selected.artist
            }
            thumbnail={
              'directAudioUrl' in selected ? selected.thumbnail : undefined
            }
            downloadUrl={
              'directAudioUrl' in selected
                ? selected.directAudioUrl || undefined
                : selected.downloadUrl || undefined
            }
            source={
              'directAudioUrl' in selected ? 'YouTube' : selected.sourceSite
            }
            duration={
              'directAudioUrl' in selected ? selected.duration : undefined
            }
            onClose={() => setSelected(null)}
          />
        </div>
      ) : null}

      {/* Right: search + results */}
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <HeroSection />

        {/* Search section */}
        <section
          className="mx-auto w-full max-w-2xl"
          aria-labelledby="search-heading"
        >
          <h2 id="search-heading" className="sr-only">
            Search
          </h2>

          {/* Reflects whether the response carried a valid session. */}
          <p className="text-muted-foreground mb-3 text-xs">
            {authenticated ? 'Signed in' : 'Not signed in'}
          </p>

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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <nav className="mt-8" aria-labelledby="recent-heading">
              <h3
                id="recent-heading"
                className="text-muted-foreground mb-2 text-xs font-medium"
              >
                Recent searches
              </h3>
              <ul className="flex list-none flex-col gap-1 p-0">
                {recentSearches.map(search => (
                  <li key={search.query}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(search.query);
                        setType(search.type);
                        setError(null);
                      }}
                      className="hover:bg-muted focus-visible:ring-ring flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      <span className="min-w-0 truncate">{search.query}</span>
                      <span className="text-muted-foreground shrink-0 text-xs">
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
        </section>

        {/* Results section */}
        <section
          className="w-full"
          aria-labelledby="results-heading"
        >
          <div className="mb-3 flex items-baseline gap-2">
            <h2 id="results-heading" className="text-sm font-medium">
              Results
            </h2>
            {/* Status region: announces "N results" as searches complete */}
            <p
              role="status"
              aria-live="polite"
              className="text-muted-foreground text-xs tabular-nums"
            >
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
            onSelect={setSelected}
          />
        </section>
      </div>
    </div>
  );
}