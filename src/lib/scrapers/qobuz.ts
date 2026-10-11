import type { ScrapedResult } from '@/types/scraped';
import type { DownloadProvider, DownloadResource, QualityOption, QobuzCredentials } from '@/types/download';
import { BaseScraper } from './base';

const QOBUZ_API_BASE = 'https://www.qobuz.com/api.json/0.2';
const QOBUZ_DOWNLOAD_BASE = 'https://download.qobuz.com';

export class QobuzScraper extends BaseScraper implements DownloadProvider {
  constructor() {
    super('qobuz', 'https://www.qobuz.com', {}, 1000, true);
  }

  async search(_query: string): Promise<ScrapedResult[]> {
    // Qobuz search would require authentication
    // For now, return empty - this scraper is mainly for downloads
    return [];
  }

  async getDownloadResources(track: ScrapedResult): Promise<DownloadResource[]> {
    const trackId = track.downloadUrl; // Qobuz track ID would be in the URL
    if (!trackId) return [];

    return [
      {
        sourceId: 'qobuz',
        sourceDisplayName: 'Qobuz',
        qualityOptions: [
          { id: 'HI_RES_LOSSLESS', label: '24-Bit Max', description: 'Highest Qobuz Hi-Res quality', kind: 'lossless' },
          { id: 'HI_RES', label: '24-Bit', description: 'Prefer 24-bit Qobuz quality', kind: 'lossless' },
          { id: 'LOSSLESS', label: 'Lossless', description: 'Standard Qobuz lossless', kind: 'lossless' },
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
    const creds = credentials as unknown as QobuzCredentials;
    const { appId, userAuthToken } = creds;
    if (!appId || !userAuthToken) {
      throw new Error('Missing Qobuz credentials');
    }

    // Step 1: Get track info and download URL from Qobuz API
    const formatId = this.mapQualityToFormatId(qualityId);
    const downloadUrl = `${QOBUZ_API_BASE}/track/getFileUrl?format_id=${formatId}&track_id=${trackId}&app_id=${appId}&user_auth_token=${userAuthToken}`;

    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Qobuz API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('No download URL returned from Qobuz');
    }

    // Step 2: Stream the actual audio file
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
      { id: 'HI_RES_LOSSLESS', label: '24-Bit Max', description: 'Highest Qobuz Hi-Res quality', kind: 'lossless' },
      { id: 'HI_RES', label: '24-Bit', description: 'Prefer 24-bit Qobuz quality', kind: 'lossless' },
      { id: 'LOSSLESS', label: 'Lossless', description: 'Standard Qobuz lossless', kind: 'lossless' },
    ];
  }

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const creds = credentials as unknown as QobuzCredentials;
    const { appId, userAuthToken } = creds;
    if (!appId || !userAuthToken) return false;

    try {
      const response = await fetch(`${QOBUZ_API_BASE}/user/get?app_id=${appId}&user_auth_token=${userAuthToken}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private mapQualityToFormatId(qualityId: string): number {
    switch (qualityId) {
      case 'HI_RES_LOSSLESS':
        return 27; // 24-bit Hi-Res FLAC
      case 'HI_RES':
        return 27;
      case 'LOSSLESS':
      default:
        return 6; // 16-bit FLAC
    }
  }
}

export const qobuzScraper = new QobuzScraper();