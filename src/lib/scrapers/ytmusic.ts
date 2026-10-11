import type { ScrapedResult } from '@/types/scraped';
import type { DownloadProvider, DownloadResource, QualityOption, YTMusicCredentials } from '@/types/download';
import { BaseScraper } from './base';

const YTM_API_BASE = 'https://music.youtube.com/youtubei/v1';

export class YTMusicScraper extends BaseScraper implements DownloadProvider {
  constructor() {
    super('ytmusic', 'https://music.youtube.com', {}, 1000, true);
  }

  async search(_query: string): Promise<ScrapedResult[]> {
    // YTMusic search would require innerTube API
    return [];
  }

  async getDownloadResources(track: ScrapedResult): Promise<DownloadResource[]> {
    const trackId = track.downloadUrl; // videoId
    if (!trackId) return [];

    return [
      {
        sourceId: 'ytmusic',
        sourceDisplayName: 'YouTube Music',
        qualityOptions: [
          { id: 'BEST', label: 'Best Available', description: 'Highest quality YouTube Music offers', kind: 'lossless' },
          { id: 'HIGH', label: 'High (256kbps AAC)', description: 'Standard high quality', kind: 'lossy' },
          { id: 'MEDIUM', label: 'Medium (128kbps AAC)', description: 'Standard quality', kind: 'lossy' },
          { id: 'LOW', label: 'Low (48kbps Opus)', description: 'Low quality', kind: 'lossy' },
        ],
        requiresAuth: true,
        trackId,
        trackMetadata: { title: track.title, artist: track.artist },
      },
    ];
  }

  async getDownloadStream(
    trackId: string,
    qualityId: string,
    credentials: Record<string, string>
  ): Promise<ReadableStream<Uint8Array>> {
    const creds = credentials as unknown as YTMusicCredentials;
    const { cookie, apiKey } = creds;
    if (!cookie && !apiKey) {
      throw new Error('Missing YouTube Music credentials (cookie or API key)');
    }

    // For YouTube Music, we'll use yt-dlp approach via API
    // This is a simplified implementation - real implementation would use innerTube API
    const format = this.mapQualityToFormat(qualityId);
    const downloadUrl = `${YTM_API_BASE}/player?videoId=${trackId}&format=${format}&key=${apiKey || 'default'}`;

    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...(cookie ? { Cookie: cookie } : {}),
      },
    });

    if (!response.ok) {
      // Fallback: try to get streaming URL via yt-dlp approach
      throw new Error(`YouTube Music API error: ${response.status}`);
    }

    const data = await response.json();
    const streamUrl = data.streamingData?.adaptiveFormats?.[0]?.url;
    if (!streamUrl) {
      throw new Error('No streaming URL found');
    }

    const fileResponse = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...(cookie ? { Cookie: cookie } : {}),
      },
    });

    if (!fileResponse.ok || !fileResponse.body) {
      throw new Error(`Failed to fetch audio file: ${fileResponse.status}`);
    }

    return fileResponse.body;
  }

  getQualities(): QualityOption[] {
    return [
      { id: 'BEST', label: 'Best Available', description: 'Highest quality YouTube Music offers', kind: 'lossless' },
      { id: 'HIGH', label: 'High (256kbps AAC)', description: 'Standard high quality', kind: 'lossy' },
      { id: 'MEDIUM', label: 'Medium (128kbps AAC)', description: 'Standard quality', kind: 'lossy' },
      { id: 'LOW', label: 'Low (48kbps Opus)', description: 'Low quality', kind: 'lossy' },
    ];
  }

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const creds = credentials as unknown as YTMusicCredentials;
    const { cookie, apiKey } = creds;
    if (!cookie && !apiKey) return false;

    try {
      const response = await fetch(`${YTM_API_BASE}/browse?key=${apiKey || 'default'}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(cookie ? { Cookie: cookie } : {}),
        },
        method: 'POST',
        body: JSON.stringify({ context: { client: { clientName: 'WEB_REMIX', clientVersion: '1.0' } } }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private mapQualityToFormat(qualityId: string): string {
    switch (qualityId) {
      case 'BEST':
        return 'best';
      case 'HIGH':
        return 'high';
      case 'MEDIUM':
        return 'medium';
      case 'LOW':
      default:
        return 'low';
    }
  }
}

export const ytmusicScraper = new YTMusicScraper();