'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Group, Panel, Separator } from 'react-resizable-panels';

const PANEL_MIN_WIDTH = 280;
const PANEL_MAX_WIDTH = 600;

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

  const { count: queueCount } = useQueue();
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
        (r: unknown) => r && typeof r === 'object' && 'webpageUrl' in r
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

  function handlePanelClose() {
    setPanelOpen(false);
    setSelectedTrack(null);
  }

  // Render main content (search UI)
  const mainContent = (
    <div className="relative min-h-screen flex flex-col">
      <div className={cn(
        "mx-auto flex w-full flex-col items-center gap-8 px-4 pb-12 pt-12 transition-all duration-300",
        panelOpen ? "max-w-[calc(100%-24rem)]" : "max-w-full"
      )}>
        <HeroSection />

        {/* Search section */}
        <section
          ref={searchContainerRef}
          className="relative mx-auto w-full max-w-2xl min-w-[280px]"
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

      {/* Queue FAB - positioned relative to viewport, not panel */}
      <button
        type="button"
        onClick={() => setQueueOpen(true)}
        className={cn(
          "fixed bottom-6 z-30 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95",
          panelOpen ? "right-[calc(6rem + 280px)]" : "right-6"
        )}
        aria-label={`Open download queue (${queueCount} tracks)`}
      >
        <ListMusic className="size-5" aria-hidden="true" />
        {queueCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {queueCount > 99 ? '99+' : queueCount}
          </span>
        ) : null}
      </button>
    </div>
  );

  // When panel is closed, render main content full width without panel group
  if (!panelOpen) {
    return (
      <div className="relative min-h-screen">
        {mainContent}
        {/* Queue side panel */}
        <QueuePanel open={queueOpen} onClose={() => setQueueOpen(false)} />
      </div>
    );
  }

  // When panel is open, use resizable panel group
  return (
    <div className="relative min-h-screen flex">
      <Group
        id="main-layout"
        orientation="horizontal"
        className="flex-1 min-w-0"
        style={{ minHeight: '100vh' }}
      >
        {/* Main content panel - takes remaining space */}
        <Panel
          id="main-content"
          defaultSize="70%"
          minSize="30%"
          maxSize="100%"
        >
          {mainContent}
        </Panel>

        {/* Resize handle */}
        <Separator
          className={cn(
            "relative z-50 w-px bg-muted-foreground/30 hover:bg-primary transition-colors",
            "after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:size-6 after:rounded-full after:bg-primary after:shadow-lg after:transition-all hover:after:scale-110"
          )}
          aria-label="Resize details panel"
        />

        {/* Track Details Panel - resizable side panel */}
        <Panel
          id="details-panel"
          defaultSize="30%"
          minSize={PANEL_MIN_WIDTH}
          maxSize={PANEL_MAX_WIDTH}
          collapsible
          collapsedSize={0}
        >
          <div className="flex h-full flex-col border-l bg-background shadow-lg overflow-hidden">
            <SearchPanel
              open={panelOpen}
              selectedTrack={selectedTrack}
              onClose={handlePanelClose}
            />
          </div>
        </Panel>
      </Group>

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