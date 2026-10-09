import { execFile } from 'child_process';
import { promisify } from 'util';
import { env } from '../env';
import type { ExtractedTrack, ExtractedPlaylist } from '../../types/extracted';

const execFileAsync = promisify(execFile);

const YTDLP_TIMEOUT_MS = 60000;
const YTDLP_PATH = env.YT_DLP_PATH;

export interface ExtractOptions {
  timeout?: number;
  ffmpegPath?: string;
}

export async function extract(
  url: string,
  options: ExtractOptions = {}
): Promise<ExtractedTrack[]> {
  const timeout = options.timeout ?? YTDLP_TIMEOUT_MS;
  // `--flat-playlist` was the bug: it strips the `formats` array from every
  // entry, so normalizeTrack found zero audio-only formats and fell back to
  // the top-level `url`, which is the *video* page URL. Every YouTube result
  // came back with an empty directAudioUrl. Without the flag the full format
  // list is present and the best audio stream is picked below.
  const args = ['--dump-json', '--no-download', url];

  try {
    const { stdout, stderr } = await execFileAsync(YTDLP_PATH, args, {
      timeout,
      maxBuffer: 50 * 1024 * 1024,
      env: {
        ...process.env,
        PATH: `${process.env.PATH};C:\\Windows\\System32`,
      },
    });

    if (stderr && !stdout) {
      throw new Error(`yt-dlp stderr: ${stderr}`);
    }

    const lines = stdout.trim().split('\n').filter(Boolean);
    const tracks: ExtractedTrack[] = [];

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        const track = normalizeTrack(data);
        if (track) tracks.push(track);
      } catch {
        continue;
      }
    }

    return tracks;
  } catch (error) {
    const err = error as ExecFileError;
    if (
      err.killed ||
      err.code === 'ETIMEDOUT' ||
      err.message?.includes('timed out')
    ) {
      throw new Error(`yt-dlp timeout after ${timeout}ms for URL: ${url}`);
    }
    throw error;
  }
}

/**
 * Subset of yt-dlp's `--dump-json` output that we consume. Every field is
 * optional because yt-dlp omits keys depending on the extractor, so this
 * models absence rather than lying about it.
 */
interface YtDlpFormat {
  acodec?: string | null;
  vcodec?: string | null;
  url?: string;
  format_id?: string;
  abitrate?: number | null;
  tbr?: number | null;
}

interface YtDlpEntry {
  id?: string;
  title?: string | null;
  uploader?: string | null;
  artist?: string | null;
  creator?: string | null;
  duration?: number | null;
  thumbnail?: string | null;
  thumbnails?: { url?: string }[];
  webpage_url?: string;
  original_url?: string;
  url?: string;
  format_id?: string;
  extractor?: string | null;
  formats?: YtDlpFormat[];
  _playlist_index?: number;
  _playlist_title?: string;
}

/** execFile rejections carry the child's signal, exit code, and stdout. */
interface ExecFileError extends Error {
  killed?: boolean;
  code?: string | number;
  stdout?: string;
}

function isAudioOnly(format: YtDlpFormat): boolean {
  // `acodec` is undefined on some entries (HLS segments), so treat an
  // undefined/empty acodec as "no audio" rather than "has audio".
  return Boolean(format.acodec) && format.vcodec === 'none' && Boolean(format.url);
}

function formatBitrate(format: YtDlpFormat): number {
  // abitrate is undefined on YouTube entries; tbr is the reliable field.
  return format.tbr ?? format.abitrate ?? 0;
}

function normalizeTrack(data: YtDlpEntry): ExtractedTrack | null {
  if (!data?.id) return null;

  const audioFormats = (data.formats ?? []).filter(isAudioOnly);
  const bestAudio = audioFormats.reduce<YtDlpFormat | null>(
    (best, current) =>
      formatBitrate(current) > formatBitrate(best ?? {}) ? current : best,
    null
  );

  const thumbnail =
    data.thumbnail ||
    data.thumbnails?.find((t) => t.url)?.url ||
    '';

  return {
    title: data.title || 'Unknown Title',
    artist: data.uploader || data.artist || data.creator || 'Unknown Artist',
    duration: data.duration || 0,
    thumbnail,
    webpageUrl: data.webpage_url || data.original_url || '',
    // Only an audio stream is a directAudioUrl. The previous fallback to
    // `data.url` returned the video page URL (or an empty string when
    // --flat-playlist had stripped formats), which is how YouTube results
    // showed up un-downloadable.
    directAudioUrl: bestAudio?.url || '',
    formatId: bestAudio?.format_id || data.format_id || '',
    extractor: data.extractor || 'unknown',
    playlistIndex: data._playlist_index,
    playlistTitle: data._playlist_title,
  };
}

/**
 * Resolve a free-text song query to YouTube audio tracks via yt-dlp's
 * `ytsearch` extractor. This is the song-search path: instead of scraping
 * individual music/torrent sites (whose selectors are unverified and whose
 * results carry no direct audio URL), every hit is a real YouTube video
 * resolved to an audio stream by the same normalizeTrack logic as a URL.
 *
 * `ytsearch:N` caps the search at N entries. YouTube intermittently returns
 * "Sign in to confirm you're not a bot" on the later entries of a multi-hit
 * search, which makes yt-dlp exit non-zero. We still parse whatever JSON
 * came through stdout rather than throwing the whole result away — one or
 * two good hits beats an empty page.
 */
export async function extractSearch(
  query: string,
  count = 5,
  options: ExtractOptions = {}
): Promise<ExtractedTrack[]> {
  const timeout = options.timeout ?? YTDLP_TIMEOUT_MS;
  const limit = Math.max(1, Math.min(count, 20));
  const args = ['--dump-json', '--no-download', `ytsearch${limit}:${query}`];

  let stdout = '';
  try {
    const result = await execFileAsync(YTDLP_PATH, args, {
      timeout,
      maxBuffer: 50 * 1024 * 1024,
      env: {
        ...process.env,
        PATH: `${process.env.PATH};C:\\Windows\\System32`,
      },
    });
    stdout = result.stdout;
  } catch (error) {
    const err = error as ExecFileError;
    // yt-dlp exits non-zero when some entries hit the bot check, but it
    // still prints the entries it *could* resolve. Carry on with those.
    stdout = (err as { stdout?: string }).stdout ?? '';
    if (
      err.killed ||
      err.code === 'ETIMEDOUT' ||
      err.message?.includes('timed out')
    ) {
      throw new Error(`yt-dlp search timed out after ${timeout}ms for: ${query}`);
    }
    if (!stdout.trim()) {
      throw error;
    }
  }

  const lines = stdout.trim().split('\n').filter(Boolean);
  const tracks: ExtractedTrack[] = [];

  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      const track = normalizeTrack(data);
      if (track) tracks.push(track);
    } catch {
      continue;
    }
  }

  return tracks;
}

export async function extractSingle(
  url: string,
  options: ExtractOptions = {}
): Promise<ExtractedTrack | null> {
  const tracks = await extract(url, options);
  return tracks.length > 0 ? tracks[0] : null;
}

export async function extractPlaylist(
  url: string,
  options: ExtractOptions = {}
): Promise<ExtractedPlaylist | null> {
  const tracks = await extract(url, options);
  if (tracks.length === 0) return null;
  return {
    title: tracks[0].playlistTitle || 'Unknown Playlist',
    tracks,
  };
}

export async function extractSongTitle(url: string): Promise<string> {
  const track = await extractSingle(url);
  if (!track) throw new Error(`Could not extract title from ${url}`);
  return stripVideoIndicators(track.title);
}

export function stripVideoIndicators(title: string): string {
  return title
    .replace(/\s*\(Official Video\)/gi, '')
    .replace(/\s*\(Official Music Video\)/gi, '')
    .replace(/\s*\(Visualizer\)/gi, '')
    .replace(/\s*\(Lyric Video\)/gi, '')
    .replace(/\s*\(Audio\)/gi, '')
    .replace(/\s*\[Official Video\]/gi, '')
    .replace(/\s*\[Official Music Video\]/gi, '')
    .replace(/\s*\(feat\.[^)]*\)/gi, '')
    .replace(/\s*\(ft\.[^)]*\)/gi, '')
    .replace(/\s+-\s+(Official|Topic|Remix|Cover|Live|Acoustic).*$/i, '')
    .trim();
}
