'use client';

import { ExternalLink, Music } from 'lucide-react';
import type { ExtractedTrack } from '@/types/extracted';
import { cn } from '@/lib/utils';

interface SearchResultsDropdownProps {
  tracks: ExtractedTrack[];
  loading: boolean;
  onSelect: (track: ExtractedTrack) => void;
}

export function SearchResultsDropdown({
  tracks,
  loading,
  onSelect,
}: SearchResultsDropdownProps) {
  if (loading) {
    return (
      <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border bg-background p-4 text-center text-sm text-muted-foreground shadow-lg">
        Searching…
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border bg-background p-4 text-center text-sm text-muted-foreground shadow-lg">
        No results found
      </div>
    );
  }

  return (
    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-xl border bg-background shadow-lg">
      {tracks.map(track => (
        <button
          key={track.webpageUrl}
          type="button"
          onClick={() => onSelect(track)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
        >
          {track.thumbnail ? (
            <img
              src={track.thumbnail}
              alt=""
              className="size-10 shrink-0 rounded object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted">
              <Music className="size-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{track.title}</p>
            <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatDuration(track.duration)}
          </span>
          <ExternalLink className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
