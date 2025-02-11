using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyFollowedArtistsResponse
    {
        public SpotifyFollowedArtistItems artists { get; set; }
    }
}