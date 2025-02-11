import { FollowedArtistImage } from "./FollowedArtistImage.model";

export interface FollowedArtist {
    id: string;
    name: string;
    images: FollowedArtistImage[];
    type: string;
  }
  