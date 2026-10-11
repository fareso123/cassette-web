import type { ScrapedResult } from '@/types/scraped';
import type { DownloadProvider, DownloadResource, QualityOption, AmazonCredentials } from '@/types/download';
import { BaseScraper } from './base';

const AMAZON_API_BASE = 'https://na.mesk.skill.music.a2z.com/api';

export class AmazonScraper extends BaseScraper implements DownloadProvider {
  constructor() {
    super('amazon', 'https://music.amazon.com', {}, 1000, true);
  }

  async search(_query: string): Promise<ScrapedResult[]> {
    // Amazon search would require authentication
    return [];
  }

  async getDownloadResources(track: ScrapedResult): Promise<DownloadResource[]> {
    const trackId = track.downloadUrl; // ASIN
    if (!trackId) return [];

    return [
      {
        sourceId: 'amazon',
        sourceDisplayName: 'Amazon Music',
        qualityOptions: [
          { id: 'FLAC_BEST', label: 'FLAC Best Available', description: 'Up to 24-bit/192kHz', kind: 'lossless' },
          { id: 'FLAC', label: 'FLAC', description: 'Standard FLAC', kind: 'lossless' },
          { id: 'OPUS', label: 'Opus 320kbps', description: 'High quality Opus', kind: 'lossy' },
          { id: 'EAC3', label: 'Dolby Digital Plus', description: 'E-AC-3 surround', kind: 'spatial' },
          { id: 'AC4', label: 'Dolby Atmos (AC-4)', description: 'Dolby Atmos immersive', kind: 'spatial' },
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
    const creds = credentials as unknown as AmazonCredentials;
    const { csrfToken, sessionId, deviceId } = creds;
    if (!csrfToken || !sessionId || !deviceId) {
      throw new Error('Missing Amazon Music credentials');
    }

    // Step 1: Get download URL from Amazon API
    const format = this.mapQualityToFormat(qualityId);
    const downloadUrl = `${AMAZON_API_BASE}/download?asin=${trackId}&format=${format}`;

    const response = await fetch(downloadUrl, {
      headers: {
        'X-CSRF-Token': csrfToken,
        'X-Session-Id': sessionId,
        'X-Device-Id': deviceId,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Amazon API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('No download URL returned from Amazon');
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
      { id: 'FLAC_BEST', label: 'FLAC Best Available', description: 'Up to 24-bit/192kHz', kind: 'lossless' },
      { id: 'FLAC', label: 'FLAC', description: 'Standard FLAC', kind: 'lossless' },
      { id: 'OPUS', label: 'Opus 320kbps', description: 'High quality Opus', kind: 'lossy' },
      { id: 'EAC3', label: 'Dolby Digital Plus', description: 'E-AC-3 surround', kind: 'spatial' },
      { id: 'AC4', label: 'Dolby Atmos (AC-4)', description: 'Dolby Atmos immersive', kind: 'spatial' },
    ];
  }

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const creds = credentials as unknown as AmazonCredentials;
    const { csrfToken, sessionId, deviceId } = creds;
    if (!csrfToken || !sessionId || !deviceId) return false;

    try {
      const response = await fetch(`${AMAZON_API_BASE}/library/tracks?limit=1`, {
        headers: {
          'X-CSRF-Token': csrfToken,
          'X-Session-Id': sessionId,
          'X-Device-Id': deviceId,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private mapQualityToFormat(qualityId: string): string {
    switch (qualityId) {
      case 'FLAC_BEST':
        return 'FLAC_HIRES';
      case 'FLAC':
        return 'FLAC';
      case 'OPUS':
        return 'OPUS_320';
      case 'EAC3':
        return 'EAC3';
      case 'AC4':
        return 'AC4';
      default:
        return 'FLAC';
    }
  }
}

export const amazonScraper = new AmazonScraper();