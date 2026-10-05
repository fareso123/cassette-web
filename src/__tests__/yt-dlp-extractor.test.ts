import { describe, test, expect } from 'bun:test';
import {
  extract,
  extractSingle,
  extractSongTitle,
  stripVideoIndicators,
} from '@/lib/extractors/yt-dlp';

describe('yt-dlp extractor', () => {
  test('should export extract function', () => {
    expect(typeof extract).toBe('function');
  });

  test('should export extractSingle function', () => {
    expect(typeof extractSingle).toBe('function');
  });

  test('should export extractSongTitle function', () => {
    expect(typeof extractSongTitle).toBe('function');
  });

  test('should export stripVideoIndicators function', () => {
    expect(typeof stripVideoIndicators).toBe('function');
  });

  test('should strip video indicators from title', () => {
    const result = stripVideoIndicators(
      'Never Gonna Give You Up (Official Video)'
    );
    expect(result).toBe('Never Gonna Give You Up');
  });

  test('should strip feat. indicators from title', () => {
    const result = stripVideoIndicators('Song Name (feat. Other Artist)');
    expect(result).toBe('Song Name');
  });

  test('should strip Official Music Video from title', () => {
    const result = stripVideoIndicators('Test Song [Official Music Video]');
    expect(result).toBe('Test Song');
  });
});
