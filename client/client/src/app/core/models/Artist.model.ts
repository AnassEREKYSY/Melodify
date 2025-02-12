import { ArtistFollowers } from "./ArtistFollowers";
import { FollowedArtistImage } from "./FollowedArtistImage.model";

export interface Artist {
    id:string;
    name: string;
    genres:string[];
    popularity:number;
    followers:ArtistFollowers;
    images:FollowedArtistImage[];
    imageUrl:string;
}