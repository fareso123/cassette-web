import { execFile } from 'child_process';
import { promisify } from 'util';
import { env } from '../env';
import type {
  ExtractedTrack,
  ExtractedPlaylist,
  ExtractedResult,
} from '../../types/extracted';

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
  } catch (error: any) {
    if (
      error.killed ||
      error.code === 'ETIMEDOUT' ||
      error.message?.includes('timed out')
    ) {
      throw new Error(`yt-dlp timeout after ${timeout}ms for URL: ${url}`);
    }
    throw error;
  }
}

function normalizeTrack(data: any): ExtractedTrack | null {
  if (!data || !data.id) return null;

  const formats = data.formats || [];
  const audioFormats = formats.filter(
    (f: any) => f.acodec && f.vcodec === 'none' && f.url
  );
  const bestAudio =
    audioFormats.length > 0
      ? audioFormats.reduce((best: any, current: any) => {
          const bestBitrate = best?.abitrate || 0;
          const currentBitrate = current?.abitrate || 0;
          return currentBitrate > bestBitrate ? current : best;
        }, audioFormats[0])
      : null;

  const thumbnail =
    data.thumbnail ||
    (data.thumbnails?.length > 0 ? data.thumbnails[0].url : '') ||
    '';
  const artist =
    data.uploader || data.artist || data.creator || 'Unknown Artist';

  return {
    title: data.title || 'Unknown Title',
    artist: artist,
    duration: data.duration || 0,
    thumbnail: thumbnail,
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
