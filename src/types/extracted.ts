export interface ExtractedTrack {
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  webpageUrl: string;
  directAudioUrl: string;
  formatId: string;
  extractor: string;
  playlistIndex?: number;
  playlistTitle?: string;
}

export interface ExtractedPlaylist {
  title: string;
  tracks: ExtractedTrack[];
}

export interface ExtractedResult {
  type: 'track' | 'playlist';
  track?: ExtractedTrack;
  playlist?: ExtractedPlaylist;
}
