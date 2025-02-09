import { Song } from "./Song.model";

export interface Playlist {
    id: string;
    name: string;
    description: string;
    userId: string;
    isPublic: boolean;
    externalUrl: string;
    imageUrls: string[];
    ownerDisplayName: string;
    ownerUri: string;
    snapshotId: string;
    songs: Song[];
  }