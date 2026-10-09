'use client';

import { Play, Download, X, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlayerPanelProps {
  title: string;
  artist?: string;
  thumbnail?: string;
  downloadUrl?: string;
  source?: string;
  duration?: number;
  onClose: () => void;
}

function formatDuration(duration: number): string {
  const total = Math.floor(duration);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function PlayerPanel({
  title,
  artist,
  thumbnail,
  downloadUrl,
  source,
  duration,
  onClose,
}: PlayerPanelProps) {
  return (
    <aside
      aria-label="Selected track"
      className={cn(
        'border-border bg-card flex w-full shrink-0 flex-col overflow-hidden rounded-xl border',
        'animate-in slide-in-from-left-2 duration-200'
      )}
    >
      {/* Art */}
      <div className="relative aspect-video shrink-0 bg-muted">
        {thumbnail ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt=""
              className="h-full w-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Music className="text-muted-foreground size-8" aria-hidden="true" />
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 size-7 rounded-full bg-black/40 text-white hover:bg-black/60"
          aria-label="Close panel"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>

        {duration ? (
          <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] tabular-nums text-white">
            {formatDuration(duration)}
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {title}
        </h3>
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <span className="truncate">{artist || 'Unknown artist'}</span>
          {source ? (
            <>
              <span className="shrink-0 opacity-50">·</span>
              <span className="truncate">{source}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex gap-2 border-t p-4 pt-3">
        <Button
          type="button"
          variant="default"
          className="flex-1 gap-2"
          disabled={!downloadUrl}
          onClick={() => {
            if (downloadUrl) window.open(downloadUrl, '_blank', 'noopener noreferrer');
          }}
        >
          <Play className="size-4" aria-hidden="true" />
          Play
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1 gap-2"
          disabled={!downloadUrl}
          onClick={() => {
            if (downloadUrl) window.open(downloadUrl, '_blank', 'noopener noreferrer');
          }}
        >
          <Download className="size-4" aria-hidden="true" />
          Download
        </Button>
      </div>
    </aside>
  );
}