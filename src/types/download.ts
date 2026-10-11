export type QualityKind = 'lossless' | 'lossy' | 'spatial';

export interface QualityOption {
  id: string;
  label: string;
  description?: string;
  kind: QualityKind;
  estimatedSizeMB?: number;
}

export interface DownloadResource {
  sourceId: string;
  sourceDisplayName: string;
  qualityOptions: QualityOption[];
  requiresAuth: boolean;
  trackId: string;
  trackMetadata?: Record<string, unknown>;
}

export interface DownloadProvider {
  getDownloadResources(track: ScrapedResult): Promise<DownloadResource[]>;
  getDownloadStream(
    trackId: string,
    qualityId: string,
    credentials: Record<string, string>
  ): Promise<ReadableStream<Uint8Array>>;
  getQualities(): QualityOption[];
  validateCredentials(credentials: Record<string, string>): Promise<boolean>;
}

// Credential shapes per source
export interface QobuzCredentials {
  appId: string;
  userAuthToken: string;
}

export interface TidalCredentials {
  token: string;
  userId: string;
  countryCode: string;
}

export interface AmazonCredentials {
  csrfToken: string;
  sessionId: string;
  deviceId: string;
}

export interface YTMusicCredentials {
  cookie?: string;
  apiKey?: string;
}

export type SourceCredentials =
  | QobuzCredentials
  | TidalCredentials
  | AmazonCredentials
  | YTMusicCredentials;

export interface CredentialMap {
  qobuz?: QobuzCredentials;
  tidal?: TidalCredentials;
  amazon?: AmazonCredentials;
  ytmusic?: YTMusicCredentials;
}

// Re-export ScrapedResult for DownloadProvider interface
import type { ScrapedResult } from './scraped';