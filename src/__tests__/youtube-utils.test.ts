import { describe, test, expect } from 'bun:test';
import { parseYouTubeUrl, stripVideoIndicators } from '@/lib/youtube';

describe('YouTube URL utilities', () => {
  test('should parse YouTube video URLs to videoId', () => {
    const result = parseYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result).toEqual({ videoId: 'dQw4w9WgXcQ', playlistId: null });
  });

  test('should parse YouTube short URLs to videoId', () => {
    const result = parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(result).toEqual({ videoId: 'dQw4w9WgXcQ', playlistId: null });
  });

  test('should parse playlist URLs to playlistId', () => {
    const result = parseYouTubeUrl(
      'https://youtube.com/playlist?list=PLJe3XBuIT7HN9t5rR5K6Xm6wV8s6jKqZc'
    );
    expect(result).toEqual({
      videoId: null,
      playlistId: 'PLJe3XBuIT7HN9t5rR5K6Xm6wV8s6jKqZc',
    });
  });

  test('should return null for invalid YouTube URLs', () => {
    const result = parseYouTubeUrl('https://example.com/watch?v=123');
    expect(result).toEqual({ videoId: null, playlistId: null });
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
