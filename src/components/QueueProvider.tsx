'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ExtractedTrack } from '@/types/extracted';
import type { ScrapedResult } from '@/types/scraped';
import {
  addToQueue as addToFile,
  clearQueue as clearFile,
  getQueue,
  removeFromQueue as removeFromFile,
  type QueuedTrack,
} from '@/lib/queue';

interface QueueContextValue {
  queue: QueuedTrack[];
  add: (result: ExtractedTrack | ScrapedResult) => void;
  remove: (id: string) => void;
  clear: () => void;
  downloadAll: () => void;
  count: number;
}

const QueueContext = createContext<QueueContextValue | null>(null);

export function useQueue(): QueueContextValue {
  const ctx = useContext(QueueContext);
  if (!ctx) {
    throw new Error('useQueue must be rendered inside a QueueProvider');
  }
  return ctx;
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueuedTrack[]>([]);
  const hydrated = useRef(false);

  // Hydrate from localStorage after mount. Reading during render would
  // cause a hydration mismatch (SSR sees an empty list), so do it in an
  // effect and accept the one-frame flash — the panel is opt-in anyway.
  // Using a ref to guard against double-invocation in strict mode.
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      setQueue(getQueue());
    }
  }, []);

  const add = useCallback(
    (result: ExtractedTrack | ScrapedResult) => {
      const outcome = addToFile(result);
      if (outcome.added) {
        setQueue(outcome.queue);
      }
    },
    []
  );

  const remove = useCallback((id: string) => {
    setQueue(removeFromFile(id));
  }, []);

  const clear = useCallback(() => {
    clearFile();
    setQueue([]);
  }, []);

  const downloadAll = useCallback(() => {
    // Open each track in its own tab. A small stagger keeps the browser's
    // popup blocker from treating a burst of opens as a drive-by.
    queue.forEach((track, i) => {
      setTimeout(() => {
        window.open(track.downloadUrl, '_blank', 'noopener noreferrer');
      }, i * 300);
    });
  }, [queue]);

  const value = useMemo<QueueContextValue>(
    () => ({
      queue,
      add,
      remove,
      clear,
      downloadAll,
      count: queue.length,
    }),
    [queue, add, remove, clear, downloadAll]
  );

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}

export type { QueuedTrack };