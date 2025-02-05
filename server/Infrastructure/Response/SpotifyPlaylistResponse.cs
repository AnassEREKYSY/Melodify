using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyPlaylistResponse
    {
        [JsonPropertyName("items")]
        public List<SpotifyPlaylistItem> Items { get; set; }

        [JsonPropertyName("limit")]
        public int Limit { get; set; }

        [JsonPropertyName("offset")]
        public int Offset { get; set; }

        [JsonPropertyName("total")]
        public int Total { get; set; }

        [JsonPropertyName("next")]
        public string Next { get; set; }

        [JsonPropertyName("previous")]
        public string Previous { get; set; }
    }
}