import type {
  QobuzCredentials,
  TidalCredentials,
  AmazonCredentials,
  YTMusicCredentials,
  CredentialMap,
  SourceCredentials,
} from '@/types/download';

const STORAGE_PREFIX = 'cassette.credentials.';

type CredentialEntry = QobuzCredentials | TidalCredentials | AmazonCredentials | YTMusicCredentials;

function getStorageKey(sourceId: string): string {
  return `${STORAGE_PREFIX}${sourceId}`;
}

function parseCredentials(sourceId: string, raw: string): CredentialEntry | null {
  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

export function getCredentials(sourceId: string): CredentialEntry | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(getStorageKey(sourceId));
  if (!raw) return null;
  return parseCredentials(sourceId, raw);
}

export function setCredentials(sourceId: string, creds: CredentialEntry): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(sourceId), JSON.stringify(creds));
}

export function removeCredentials(sourceId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getStorageKey(sourceId));
}

export function hasCredentials(sourceId: string): boolean {
  return getCredentials(sourceId) !== null;
}

export function getAllCredentials(): CredentialMap {
  if (typeof window === 'undefined') return {};
  const result: CredentialMap = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      const sourceId = key.slice(STORAGE_PREFIX.length);
      const creds = getCredentials(sourceId);
      if (creds) {
        (result as Record<string, CredentialEntry>)[sourceId] = creds;
      }
    }
  }
  return result;
}

export function clearAllCredentials(): void {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

export const CREDENTIAL_HELP_TEXT: Record<string, string> = {
  qobuz:
    'Get your Qobuz credentials from browser DevTools on play.qobuz.com:\n1. Open DevTools → Application → Cookies → play.qobuz.com\n2. Copy `app_id` and `user_auth_token` values\n3. Paste as JSON: {"appId": "...", "userAuthToken": "..."}',
  tidal:
    'Get your Tidal credentials from browser DevTools on listen.tidal.com:\n1. Open DevTools → Network → Filter by "videos" or "tracks"\n2. Find a request with Authorization header\n3. Copy token, userId, and countryCode\n4. Paste as JSON: {"token": "...", "userId": "...", "countryCode": "US"}',
  amazon:
    'Get your Amazon Music credentials from browser DevTools on music.amazon.com:\n1. Open DevTools → Application → Cookies → music.amazon.com\n2. Copy `csrf_token`, `session_id`, `device_id`\n3. Paste as JSON: {"csrfToken": "...", "sessionId": "...", "deviceId": "..."}',
  ytmusic:
    'Get your YouTube Music credentials from browser DevTools on music.youtube.com:\n1. Open DevTools → Network → Filter by "browse" or "next"\n2. Find a request with Cookie header\n3. Copy the cookie string or API key\n4. Paste as JSON: {"cookie": "...", "apiKey": "..."}',
};

export const SUPPORTED_SOURCES = ['qobuz', 'tidal', 'amazon', 'ytmusic'] as const;
export type SupportedSource = (typeof SUPPORTED_SOURCES)[number];