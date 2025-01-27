namespace Infrastructure.Response
{
    public class SpotifyTrack
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public List<SpotifyArtist> Artists { get; set; }
        public SpotifyAlbum Album { get; set; }
        public int DurationMs { get; set; }
    }
}