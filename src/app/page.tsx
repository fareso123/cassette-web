'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { SearchResultsDropdown } from '@/components/SearchResultsDropdown';
import { SearchPanel } from '@/components/SearchPanel';
import { HeroSection } from '@/components/HeroSection';
import { QueuePanel } from '@/components/QueuePanel';
import { QueueProvider, useQueue } from '@/components/QueueProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ListMusic } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExtractedTrack } from '@/types/extracted';

function HomePage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'song' | 'url'>('song');
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<ExtractedTrack[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<ExtractedTrack | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);

  const { queue: queuedTracks, count: queueCount } = useQueue();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSearch(searchQuery: string, searchType: 'song' | 'url') {
    if (!searchQuery.trim()) {
      setTracks([]);
      setDropdownOpen(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim(), type: searchType }),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || `Search failed (${response.status})`);
      }

      const data = await response.json();
      const results = (data.results || []).filter(
        (r: any) => 'webpageUrl' in r
      ) as ExtractedTrack[];
      setTracks(results);
      setAuthenticated(Boolean(data.authenticated));
      setDropdownOpen(true);
    } catch (err) {
      console.error('Search error:', err);
      setTracks([]);
      setError(
        err instanceof Error ? err.message : 'Search failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length > 1) {
      handleSearch(value, type);
    } else {
      setTracks([]);
      setDropdownOpen(false);
    }
  }

  function handleTypeChange(newType: 'song' | 'url') {
    setType(newType);
    if (query.trim()) {
      handleSearch(query, newType);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query, type);
    }
  }

  function handleSelectTrack(track: ExtractedTrack) {
    setSelectedTrack(track);
    setPanelOpen(true);
    setDropdownOpen(false);
  }

  return (
    <div className="relative min-h-screen">
      <div className={cn(
        "mx-auto flex w-full flex-col items-center gap-8 px-4 pb-12 pt-12 transition-all duration-300",
        panelOpen ? "max-w-[calc(100%-24rem)]" : "max-w-full"
      )}>
        <HeroSection />

        {/* Search section */}
        <section
          ref={searchContainerRef}
          className="relative mx-auto w-full max-w-2xl"
          aria-labelledby="search-heading"
        >
          <h2 id="search-heading" className="sr-only">
            Search
          </h2>

          <p className="text-muted-foreground mb-3 text-xs">
            {authenticated ? 'Signed in' : 'Not signed in'}
          </p>

          <SearchBar
            query={query}
            type={type}
            loading={loading}
            onQueryChange={handleQueryChange}
            onTypeChange={handleTypeChange}
            onSubmit={handleSubmit}
          />

          {/* Results Dropdown */}
          {dropdownOpen && (
            <SearchResultsDropdown
              tracks={tracks}
              loading={loading}
              onSelect={handleSelectTrack}
            />
          )}

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
        </section>
      </div>

      {/* Queue FAB */}
      <button
        type="button"
        onClick={() => setQueueOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={`Open download queue (${queueCount} tracks)`}
      >
        <ListMusic className="size-5" aria-hidden="true" />
        {queueCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {queueCount > 99 ? '99+' : queueCount}
          </span>
        ) : null}
      </button>

      {/* Track Details Panel - pushes content left when open */}
      <div
        className={cn(
          "fixed right-0 top-0 z-40 h-full w-96 border-l bg-background shadow-lg transition-transform duration-300 ease-in-out",
          panelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <SearchPanel
          open={panelOpen}
          selectedTrack={selectedTrack}
          onClose={() => setPanelOpen(false)}
        />
      </div>

      {/* Queue side panel */}
      <QueuePanel open={queueOpen} onClose={() => setQueueOpen(false)} />
    </div>
  );
}

export default function Home() {
  return (
    <QueueProvider>
      <HomePage />
    </QueueProvider>
  );
}
