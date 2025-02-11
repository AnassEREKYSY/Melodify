namespace Infrastructure.Response
{
    public class SpotifyFollowedArtistItems
    {
        public List<SpotifyFollowedArtist> items { get; set; }
        public string next { get; set; }
    }
}