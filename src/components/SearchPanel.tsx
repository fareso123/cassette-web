'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Loader2, Music } from 'lucide-react';
import type { ExtractedTrack } from '@/types/extracted';
import type { ScrapedResult } from '@/types/scraped';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchPanelProps {
  open: boolean;
  selectedTrack: ExtractedTrack | null;
  onClose: () => void;
}

export function SearchPanel({ open, selectedTrack, onClose }: SearchPanelProps) {
  const [scraperResults, setScraperResults] = useState<ScrapedResult[]>([]);
  const [loadingScrapers, setLoadingScrapers] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch scraper results when a track is selected
  useEffect(() => {
    if (!open || !selectedTrack) {
      return;
    }

    let isMounted = true;
    async function fetchScraperResults() {
      setLoadingScrapers(true);
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: selectedTrack?.title,
            type: 'song',
          }),
        });
        const data = await res.json();
        if (isMounted) {
          const scraped = (data.results || []).filter(
            (r: ExtractedTrack | ScrapedResult) => 'downloadUrl' in r
          ) as ScrapedResult[];
          setScraperResults(scraped.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to fetch scraper results:', error);
        if (isMounted) {
          setScraperResults([]);
        }
      } finally {
        if (isMounted) {
          setLoadingScrapers(false);
        }
      }
    }

    fetchScraperResults();

    return () => {
      isMounted = false;
    };
  }, [open, selectedTrack]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!open || !selectedTrack) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
      className="flex h-full flex-col border-l bg-background shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
        <h2 id="panel-title" className="text-sm font-medium">
          Track Details
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-8"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Track Info */}
          <div className="mb-6">
            <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-muted">
              {selectedTrack.thumbnail ? (
                <img
                  src={selectedTrack.thumbnail}
                  alt={selectedTrack.title}
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Music className="size-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <h3 className="truncate text-base font-semibold">
              {selectedTrack.title}
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {selectedTrack.artist}
            </p>
            {selectedTrack.duration > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDuration(selectedTrack.duration)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mb-6 flex gap-2">
            <a
              href={selectedTrack.webpageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 transition-all font-medium text-sm py-2.5 px-4"
            >
              <ExternalLink className="size-4" />
              Open on YouTube
            </a>
          </div>

          {/* Scraper Results */}
          <div className="border-t pt-4">
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Download Sources
            </h4>
            {loadingScrapers ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Searching sources…
              </div>
            ) : scraperResults.length > 0 ? (
              <ul className="space-y-2">
                {scraperResults.map((result, idx) => (
                  <li key={idx}>
                    <a
                      href={result.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded bg-muted">
                        <span className="text-xs font-mono">{idx + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {result.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {result.artist} · {result.sourceSite}
                        </p>
                      </div>
                      <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No download links found for this track.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
