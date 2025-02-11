using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyFollowedArtistItems
    {
        [JsonPropertyName("items")]
        public List<SpotifyFollowedArtistDetails> Items { get; set; }
        
        [JsonPropertyName("next")]
        public string Next { get; set; }
    }
}