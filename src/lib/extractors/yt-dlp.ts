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
  const args = ['--dump-json', '--no-download', '--flat-playlist', url];

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

/** execFile rejections carry the child's signal and exit code. */
interface ExecFileError extends Error {
  killed?: boolean;
  code?: string | number;
}

function isAudioOnly(format: YtDlpFormat): boolean {
  return Boolean(format.acodec) && format.vcodec === 'none' && Boolean(format.url);
}

function normalizeTrack(data: YtDlpEntry): ExtractedTrack | null {
  if (!data?.id) return null;

  const audioFormats = (data.formats ?? []).filter(isAudioOnly);
  const bestAudio = audioFormats.reduce<YtDlpFormat | null>(
    (best, current) =>
      (current.abitrate ?? 0) > (best?.abitrate ?? 0) ? current : best,
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
    directAudioUrl: bestAudio?.url || data.url || '',
    formatId: bestAudio?.format_id || data.format_id || '',
    extractor: data.extractor || 'unknown',
    playlistIndex: data._playlist_index,
    playlistTitle: data._playlist_title,
  };
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
