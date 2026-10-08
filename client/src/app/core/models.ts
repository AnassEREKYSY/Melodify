export interface ArtistRef { id: string; name: string; }
export interface AlbumRef { id: string; name: string; image: string | null; releaseDate: string | null; }
export interface Track {
  id: string; uri: string; name: string; artists: ArtistRef[]; album: AlbumRef | null; durationMs: number; explicit: boolean;
  popularity: number | null; previewUrl: string | null; addedAt: string | null; playedAt: string | null; isLocal: boolean;
}
export interface Artist { id: string; uri: string; name: string; image: string | null; genres: string[]; followers: number | null; popularity: number | null; }
export interface Album { id: string; uri: string; name: string; albumType: string; image: string | null; releaseDate: string | null; totalTracks: number; artists: ArtistRef[]; tracks: Track[] | null; label: string | null; }
export interface Playlist {
  id: string; uri: string; name: string; description: string | null; image: string | null; owner: { id: string; name: string | null };
  trackCount: number; public: boolean; collaborative: boolean; snapshotId: string | null; isOwn: boolean;
}
export interface PlaylistDetail { playlist: Playlist; tracks: Track[]; skippedLocal: number; tracksHidden?: boolean; }
export interface User { id: string; displayName: string | null; email: string | null; image: string | null; country: string | null; product: string | null; followers: number | null; }
export interface Device { id: string | null; name: string; type: string; isActive: boolean; isRestricted: boolean; volumePercent: number | null; }
export interface PlayerState { isPlaying: boolean; progressMs: number; device: Device | null; track: Track | null; shuffle: boolean; repeat: 'off' | 'context' | 'track'; contextUri: string | null; }
export interface Paged<T> { items: T[]; total: number; offset: number; limit: number; }
export interface CountItem { name: string; count: number; }
export interface Stats {
  range: string; artistCount: number; trackCount: number; topGenres: CountItem[]; decades: CountItem[]; playsByHour: number[];
  recentPlays: number; recentMinutes: number; averagePopularity: number | null; explicitPercent: number; averageTrackSeconds: number; firstPlayedAt: string | null;
}
export interface PlaylistStats { trackCount: number; totalMinutes: number; averagePopularity: number | null; explicitPercent: number; topArtists: CountItem[]; decades: CountItem[]; duplicates: number; }
export interface ArtistPage { artist: Artist; topTracks: Track[]; albums: Album[]; following: boolean; }
export interface SearchResult { tracks: Track[]; artists: Artist[]; albums: Album[]; playlists: Playlist[]; }
export type Range = 'short' | 'medium' | 'long';
export const RANGE_LABEL: Record<Range, string> = { short: 'Last 4 weeks', medium: 'Last 6 months', long: 'All time' };
