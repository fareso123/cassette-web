'use client';

import { X, Download, Trash2, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useQueue } from './QueueProvider';

function formatDuration(duration: number): string {
  const total = Math.floor(duration);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function QueuePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { queue, remove, clear, downloadAll } = useQueue();

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Panel — slides in from the right, full height on mobile */}
      <aside
        aria-label="Download queue"
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l bg-card shadow-xl transition-transform duration-200 ease-out sm:max-w-md',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-2">
            <ListMusic className="text-muted-foreground size-4" aria-hidden="true" />
            <h2 className="text-sm font-semibold">
              Download queue
            </h2>
            <span className="text-muted-foreground text-xs tabular-nums">
              {queue.length}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close queue"
            className="size-8"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1">
          {queue.length === 0 ? (
            <div className="p-6">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle className="text-xs tracking-widest">
                    Queue is empty
                  </EmptyTitle>
                  <EmptyDescription className="text-muted-foreground normal-case tracking-normal">
                    Add tracks from search results to download them in batch.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <div className="divide-y">
              {queue.map(track => (
                <div key={track.id} className="flex gap-3 p-4">
                  {/* Art */}
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {track.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={track.thumbnail}
                        alt=""
                        className="h-full w-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ListMusic className="text-muted-foreground size-5" aria-hidden="true" />
                      </div>
                    )}
                    {track.duration ? (
                      <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[9px] tabular-nums text-white">
                        {formatDuration(track.duration)}
                      </div>
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">
                      {track.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {track.artist || 'Unknown artist'} · {track.source}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="secondary"
                      onClick={() => {
                        window.open(track.downloadUrl, '_blank', 'noopener noreferrer');
                      }}
                      aria-label={`Download ${track.title}`}
                      className="size-8"
                    >
                      <Download className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => remove(track.id)}
                      aria-label={`Remove ${track.title} from queue`}
                      className="size-8"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {queue.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center gap-2 p-4">
              <Button
                type="button"
                variant="default"
                className="flex-1 gap-2"
                onClick={downloadAll}
              >
                <Download className="size-4" aria-hidden="true" />
                Download all
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1 gap-2"
                onClick={clear}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Clear queue
              </Button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}