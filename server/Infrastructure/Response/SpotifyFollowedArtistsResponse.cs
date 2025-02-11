using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyFollowedArtistsResponse
    {
         [JsonPropertyName("artists")]
        public SpotifyFollowedArtistItems Artists { get; set; }
    }
}