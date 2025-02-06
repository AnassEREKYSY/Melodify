using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
   public class SpotifyUserProfile
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("display_name")]
        public string DisplayName { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("country")]
        public string Country { get; set; }

        [JsonPropertyName("external_urls")]
        public ExternalUrls ExternalUrls { get; set; }

        [JsonPropertyName("images")]
        public List<SpotifyImage> Images { get; set; } = new List<SpotifyImage>();

        [JsonPropertyName("product")]
        public string Product { get; set; } 

        [JsonPropertyName("uri")]
        public string Uri { get; set; }
    }
}