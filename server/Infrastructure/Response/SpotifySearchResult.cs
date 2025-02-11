namespace Infrastructure.Response
{
    public class SpotifySearchResult
    {
        public SpotifyTracks Tracks { get; set; }
        public SpotifyArtists Artists { get; set; }
        public SpotifyAlbums Albums { get; set; }
        public SpotifyPlaylists Playlists { get; set; }
        public SpotifyShows Shows { get; set; }
        public SpotifyEpisodes Episodes { get; set; }
    }
}