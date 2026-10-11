import type { ScrapedResult } from '@/types/scraped';
import type { DownloadProvider, DownloadResource, QualityOption, TidalCredentials } from '@/types/download';
import { BaseScraper } from './base';

const TIDAL_API_BASE = 'https://api.tidal.com/v1';

export class TidalScraper extends BaseScraper implements DownloadProvider {
  constructor() {
    super('tidal', 'https://listen.tidal.com', {}, 1000, true);
  }

  async search(_query: string): Promise<ScrapedResult[]> {
    // Tidal search would require authentication
    return [];
  }

  async getDownloadResources(track: ScrapedResult): Promise<DownloadResource[]> {
    const trackId = track.downloadUrl;
    if (!trackId) return [];

    return [
      {
        sourceId: 'tidal',
        sourceDisplayName: 'Tidal',
        qualityOptions: [
          { id: 'DOLBY_ATMOS', label: 'Dolby Atmos', description: 'Dolby Atmos immersive audio', kind: 'spatial' },
          { id: 'HI_RES_LOSSLESS', label: 'HiRes FLAC', description: '24-bit Hi-Res FLAC', kind: 'lossless' },
          { id: 'LOSSLESS', label: 'Lossless', description: 'TIDAL lossless FLAC', kind: 'lossless' },
          { id: 'HIGH', label: 'High', description: 'TIDAL High (AAC 320kbps)', kind: 'lossy' },
          { id: 'LOW', label: 'Low', description: 'TIDAL Low (AAC 96kbps)', kind: 'lossy' },
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
    const creds = credentials as unknown as TidalCredentials;
    const { token, userId } = creds;
    if (!token || !userId) {
      throw new Error('Missing Tidal credentials');
    }

    // Step 1: Get stream URL from Tidal API
    const audioQuality = this.mapQualityToAudioQuality(qualityId);
    const streamUrl = `${TIDAL_API_BASE}/tracks/${trackId}/streamUrl?audioQuality=${audioQuality}&playbackMode=STREAM&assetPresentation=FULL`;

    const response = await fetch(streamUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tidal-Token': token,
      },
    });

    if (!response.ok) {
      throw new Error(`Tidal API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('No stream URL returned from Tidal');
    }

    // Step 2: Stream the audio file
    const fileResponse = await fetch(data.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!fileResponse.ok || !fileResponse.body) {
      throw new Error(`Failed to fetch audio file: ${fileResponse.status}`);
    }

    return fileResponse.body;
  }

  getQualities(): QualityOption[] {
    return [
      { id: 'DOLBY_ATMOS', label: 'Dolby Atmos', description: 'Dolby Atmos immersive audio', kind: 'spatial' },
      { id: 'HI_RES_LOSSLESS', label: 'HiRes FLAC', description: '24-bit Hi-Res FLAC', kind: 'lossless' },
      { id: 'LOSSLESS', label: 'Lossless', description: 'TIDAL lossless FLAC', kind: 'lossless' },
      { id: 'HIGH', label: 'High', description: 'TIDAL High (AAC 320kbps)', kind: 'lossy' },
      { id: 'LOW', label: 'Low', description: 'TIDAL Low (AAC 96kbps)', kind: 'lossy' },
    ];
  }

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const creds = credentials as unknown as TidalCredentials;
    const { token } = creds;
    if (!token) return false;

    try {
      const response = await fetch(`${TIDAL_API_BASE}/user`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private mapQualityToAudioQuality(qualityId: string): string {
    switch (qualityId) {
      case 'DOLBY_ATMOS':
        return 'DOLBY_ATMOS';
      case 'HI_RES_LOSSLESS':
        return 'HI_RES_LOSSLESS';
      case 'LOSSLESS':
        return 'LOSSLESS';
      case 'HIGH':
        return 'HIGH';
      case 'LOW':
      default:
        return 'LOW';
    }
  }
}

export const tidalScraper = new TidalScraper();