using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyArtistShort
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }
    }
}