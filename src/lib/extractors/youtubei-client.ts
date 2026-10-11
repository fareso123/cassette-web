import { Innertube } from 'youtubei.js';
import type { ExtractedTrack } from '../../types/extracted';

let ytInstance: Innertube | null = null;

async function getYT(): Promise<Innertube> {
  if (!ytInstance) {
    ytInstance = await Innertube.create({
      retrieve_player: false,
    });
  }
  return ytInstance;
}

export async function extractSearchYouTube(
  query: string,
  count = 10
): Promise<ExtractedTrack[]> {
  try {
    const yt = await getYT();
    // Standard search - YouTube returns video results
    const search = await yt.search(query);
    const results = search.results || [];

    const tracks: ExtractedTrack[] = [];
    const typedResults = results as any[];
    for (const v of typedResults.slice(0, count)) {
      if (!v.video_id) continue;
      const title = v.title?.text || (typeof v.title === 'string' ? v.title : 'Unknown Title');
      const artist = v.author?.name || 'Unknown Artist';
      const durationText = v.length_text?.text;
      // Parse duration like "4:24" or "3:58" to seconds
      const duration = parseDuration(durationText);
      const thumbnail = v.thumbnails?.[0]?.url || '';
      const webpageUrl = `https://www.youtube.com/watch?v=${v.video_id}`;

      tracks.push({
        title,
        artist,
        duration,
        thumbnail,
        webpageUrl,
        directAudioUrl: webpageUrl,
        formatId: 'youtubei',
        extractor: 'youtubei',
      });
    }

    // Fallback to video search if no song results
    if (tracks.length === 0) {
      const videoSearch = await yt.search(query, { type: 'video' });
      const typedVideoResults = videoSearch.results as any[];
      for (const v of typedVideoResults.slice(0, count)) {
        if (!v.video_id) continue;
        const title = v.title?.text || (typeof v.title === 'string' ? v.title : 'Unknown Title');
        const artist = v.author?.name || 'Unknown Artist';
        const duration = parseDuration(v.length_text?.text);
        const thumbnail = v.thumbnails?.[0]?.url || '';
        const webpageUrl = `https://www.youtube.com/watch?v=${v.video_id}`;

        tracks.push({
          title,
          artist,
          duration,
          thumbnail,
          webpageUrl,
          directAudioUrl: webpageUrl,
          formatId: 'youtubei',
          extractor: 'youtubei-video',
        });
      }
    }

    return tracks;
  } catch (error) {
    console.error('youtubei.js search error:', error);
    return [];
  }
}

export async function extractYouTubeUrl(url: string): Promise<ExtractedTrack[]> {
  try {
    const yt = await getYT();
    const match = url.match(/(?:v=|youtu\.be\/)([^&?]+)/);
    const videoId = match ? match[1] : null;
    if (!videoId) throw new Error('Invalid YouTube URL');

    // Just return basic info from the search result structure
    // getBasicInfo requires player which we don't have without retrieve_player
    return [
      {
        title: 'YouTube Video',
        artist: 'Unknown Artist',
        duration: 0,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        webpageUrl: url,
        directAudioUrl: url,
        formatId: 'youtubei',
        extractor: 'youtubei',
      },
    ];
  } catch (error) {
    console.error('youtubei.js URL extraction error:', error);
    return [];
  }
}

function parseDuration(text?: string): number {
  if (!text) return 0;
  // Parse formats like "4:24", "3:58", "10:05"
  const match = text.match(/(\d+):(\d+)/);
  if (match) {
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    return minutes * 60 + seconds;
  }
  return 0;
}
