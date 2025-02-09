import { Playlist } from "./Playlist.model";

export interface SpotifyPaginatedPlaylists {
    playlists: Playlist[];
    total: number;
    limit: number;
    offset: number;
    next: string;
    previous: string;
}