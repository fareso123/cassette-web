import type { QualityOption, QualityKind } from '@/types/download';

const GLOBAL_QUALITY_KEY = 'cassette.download.quality.global';
const SOURCE_QUALITY_PREFIX = 'cassette.download.quality.';

export const QUALITY_OPTIONS: QualityOption[] = [
  { id: 'BEST', label: 'Best Available (Lossless)', kind: 'lossless' },
  { id: 'FLAC_24BIT', label: 'FLAC 24-bit Hi-Res', kind: 'lossless' },
  { id: 'FLAC_16BIT', label: 'FLAC 16-bit Lossless', kind: 'lossless' },
  { id: 'MP3_320', label: 'MP3 320kbps', kind: 'lossy' },
  { id: 'AUTO', label: 'Auto (Source Decides)', kind: 'lossless' },
];

export const SOURCE_QUALITY_MAP: Record<string, QualityOption[]> = {
  qobuz: [
    { id: 'HI_RES_LOSSLESS', label: '24-Bit Max', description: 'Highest Qobuz Hi-Res quality', kind: 'lossless' },
    { id: 'HI_RES', label: '24-Bit', description: 'Prefer 24-bit Qobuz quality', kind: 'lossless' },
    { id: 'LOSSLESS', label: 'Lossless', description: 'Standard Qobuz lossless', kind: 'lossless' },
  ],
  tidal: [
    { id: 'DOLBY_ATMOS', label: 'Dolby Atmos', description: 'Dolby Atmos immersive audio', kind: 'spatial' },
    { id: 'HI_RES_LOSSLESS', label: 'HiRes FLAC', description: '24-bit Hi-Res FLAC', kind: 'lossless' },
    { id: 'LOSSLESS', label: 'Lossless', description: 'TIDAL lossless FLAC', kind: 'lossless' },
    { id: 'HIGH', label: 'High', description: 'TIDAL High (AAC 320kbps)', kind: 'lossy' },
    { id: 'LOW', label: 'Low', description: 'TIDAL Low (AAC 96kbps)', kind: 'lossy' },
  ],
  amazon: [
    { id: 'FLAC_BEST', label: 'FLAC Best Available', description: 'Up to 24-bit/192kHz', kind: 'lossless' },
    { id: 'FLAC', label: 'FLAC', description: 'Standard FLAC', kind: 'lossless' },
    { id: 'OPUS', label: 'Opus 320kbps', description: 'High quality Opus', kind: 'lossy' },
    { id: 'EAC3', label: 'Dolby Digital Plus', description: 'E-AC-3 surround', kind: 'spatial' },
    { id: 'AC4', label: 'Dolby Atmos (AC-4)', description: 'Dolby Atmos immersive', kind: 'spatial' },
  ],
  ytmusic: [
    { id: 'BEST', label: 'Best Available', description: 'Highest quality YouTube Music offers', kind: 'lossless' },
    { id: 'HIGH', label: 'High (256kbps AAC)', description: 'Standard high quality', kind: 'lossy' },
    { id: 'MEDIUM', label: 'Medium (128kbps AAC)', description: 'Standard quality', kind: 'lossy' },
    { id: 'LOW', label: 'Low (48kbps Opus)', description: 'Low quality', kind: 'lossy' },
  ],
};

export type GlobalQualityId = 'BEST' | 'FLAC_24BIT' | 'FLAC_16BIT' | 'MP3_320' | 'AUTO';

function getStorageKey(sourceId: string): string {
  return `${SOURCE_QUALITY_PREFIX}${sourceId}`;
}

export function getGlobalQuality(): GlobalQualityId {
  if (typeof window === 'undefined') return 'AUTO';
  const stored = localStorage.getItem(GLOBAL_QUALITY_KEY);
  if (stored && QUALITY_OPTIONS.some((q) => q.id === stored)) {
    return stored as GlobalQualityId;
  }
  return 'AUTO';
}

export function setGlobalQuality(qualityId: GlobalQualityId): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GLOBAL_QUALITY_KEY, qualityId);
}

export function getSourceQuality(sourceId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(getStorageKey(sourceId));
}

export function setSourceQuality(sourceId: string, qualityId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(sourceId), qualityId);
}

export function removeSourceQuality(sourceId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getStorageKey(sourceId));
}

export function getEffectiveQuality(sourceId: string): string {
  const override = getSourceQuality(sourceId);
  if (override) return override;
  return getGlobalQuality();
}

export function getAvailableQualities(sourceId: string): QualityOption[] {
  return SOURCE_QUALITY_MAP[sourceId] || QUALITY_OPTIONS;
}

export function getQualityLabel(qualityId: string, sourceId?: string): string {
  const options = sourceId ? getAvailableQualities(sourceId) : QUALITY_OPTIONS;
  const found = options.find((q) => q.id === qualityId);
  return found?.label || qualityId;
}

export function getQualityKind(qualityId: string, sourceId?: string): QualityKind {
  const options = sourceId ? getAvailableQualities(sourceId) : QUALITY_OPTIONS;
  const found = options.find((q) => q.id === qualityId);
  return found?.kind || 'lossless';
}

export function getKindColor(kind: QualityKind): string {
  switch (kind) {
    case 'lossless':
      return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
    case 'spatial':
      return 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30';
    case 'lossy':
    default:
      return 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30';
  }
}