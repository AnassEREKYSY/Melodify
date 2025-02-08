import { ExternalUrls } from "./ExternalUrls.model";
import { SpotifyImage } from "./SpotifyImage.model";

export interface SpotifyUserProfile {
    id: string;
    display_name: string;
    email: string;
    country: string;
    external_urls: ExternalUrls;
    images: SpotifyImage[];
    product: string;
    uri: string;
  }