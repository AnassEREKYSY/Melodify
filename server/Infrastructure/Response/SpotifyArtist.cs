using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyArtist
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }
    }
}