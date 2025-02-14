import { Album } from "./Album.model";
import { Artist } from "./Artist.model";

export interface Song {
    id: string;
    name: string;
    artists: Artist[];
    album: Album;
    durationMs: number;
    duration_ms: number;
    previewUrl:string;
    popularity:number;
}