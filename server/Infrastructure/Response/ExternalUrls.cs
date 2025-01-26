using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class ExternalUrls
    {
        [JsonPropertyName("spotify")]
        public string Spotify { get; set; }
    }
}