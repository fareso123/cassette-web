import { extractSongTitle, stripVideoIndicators } from '../extractors/yt-dlp';

export interface YouTubeUrlInfo {
  videoId: string | null;
  playlistId: string | null;
}

export function parseYouTubeUrl(url: string): YouTubeUrlInfo {
  const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;

  if (!youtubeRegex.test(url)) {
    return { videoId: null, playlistId: null };
  }

  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) {
    return { videoId: watchMatch[1], playlistId: null };
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    return { videoId: shortMatch[1], playlistId: null };
  }

  const playlistMatch = url.match(/youtube\.com\/playlist\?list=([^&]+)/);
  if (playlistMatch) {
    return { videoId: null, playlistId: playlistMatch[1] };
  }

  return { videoId: null, playlistId: null };
}

export { extractSongTitle, stripVideoIndicators };
