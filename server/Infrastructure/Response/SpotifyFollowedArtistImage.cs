using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyFollowedArtistImage
    {
        [JsonPropertyName("url")]
        public string Url { get; set; }

        [JsonPropertyName("height")]
        public int Height { get; set; }

        [JsonPropertyName("width")]
        public int Width { get; set; }
    }
}