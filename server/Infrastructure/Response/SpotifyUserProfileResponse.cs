using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyUserProfileResponse
    {
        [JsonPropertyName("display_name")]
        public string DisplayName { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("images")]
        public List<SpotifyImage> Images { get; set; }

        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("product")]
        public string Product { get; set; }
    }
}
