/**
 * Download queue — a client-side list of tracks a user wants to download.
 *
 * The queue lives in localStorage and survives reloads, so a user can search,
 * add several hits, and batch-download them later. It is not tied to the
 * session layer: anyone can queue, signed in or not, because the queue is
 * purely a convenience for the current browser.
 *
 * Two result shapes feed it (ExtractedTrack and ScrapedResult), so we
 * normalize at the boundary and store a single QueuedTrack shape that the
 * panel can render without knowing which extractor produced it.
 */

import type { ExtractedTrack } from '@/types/extracted';
import type { ScrapedResult } from '@/types/scraped';

const STORAGE_KEY = 'downloadQueue';
const MAX_QUEUE = 100;

export interface QueuedTrack {
  id: string;
  title: string;
  artist?: string;
  downloadUrl: string;
  source: string;
  thumbnail?: string;
  duration?: number;
  addedAt: string;
}

/** Build a stable id from the download URL so duplicates collapse. */
function trackId(downloadUrl: string): string {
  // A URL can be enormous (YouTube's signed playback URLs are ~600 chars),
  // so hash rather than store it verbatim.
  let hash = 0;
  for (let i = 0; i < downloadUrl.length; i++) {
    hash = (hash << 5) - hash + downloadUrl.charCodeAt(i);
    hash |= 0; // force 32-bit int
  }
  return `q_${Math.abs(hash).toString(16)}`;
}

/**
 * Normalize either result shape into a QueuedTrack. Returns null when the
 * track has no downloadable URL — there is nothing to queue.
 */
export function toQueuedTrack(
  result: ExtractedTrack | ScrapedResult
): QueuedTrack | null {
  const downloadUrl =
    'directAudioUrl' in result
      ? result.directAudioUrl || undefined
      : result.downloadUrl || undefined;

  if (!downloadUrl) return null;

  return {
    id: trackId(downloadUrl),
    title: result.title,
    artist: result.artist,
    downloadUrl,
    source: 'directAudioUrl' in result ? 'YouTube' : result.sourceSite,
    thumbnail: 'directAudioUrl' in result ? result.thumbnail : undefined,
    duration: 'directAudioUrl' in result ? result.duration : undefined,
    addedAt: new Date().toISOString(),
  };
}

function readQueue(): QueuedTrack[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is QueuedTrack =>
        typeof t === 'object' &&
        t !== null &&
        typeof (t as QueuedTrack).id === 'string' &&
        typeof (t as QueuedTrack).title === 'string' &&
        typeof (t as QueuedTrack).downloadUrl === 'string'
    );
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedTrack[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // QuotaExceededError is possible if the queue grows past the ~5MB budget;
    // the caller (addToQueue) caps it, so this is a last-resort guard.
  }
}

export function getQueue(): QueuedTrack[] {
  return readQueue();
}

export function addToQueue(
  result: ExtractedTrack | ScrapedResult
): { added: true; queue: QueuedTrack[] } | { added: false; reason: string } {
  const track = toQueuedTrack(result);
  if (!track) {
    return { added: false, reason: 'No downloadable URL for this track' };
  }

  const queue = readQueue();
  if (queue.some(t => t.id === track.id)) {
    return { added: false, reason: 'Already in queue' };
  }

  // Newest first, capped so a runaway session cannot fill localStorage.
  const next = [track, ...queue].slice(0, MAX_QUEUE);
  writeQueue(next);
  return { added: true, queue: next };
}

export function removeFromQueue(id: string): QueuedTrack[] {
  const queue = readQueue().filter(t => t.id !== id);
  writeQueue(queue);
  return queue;
}

export function clearQueue(): void {
  writeQueue([]);
}

export function queueCount(): number {
  return readQueue().length;
}