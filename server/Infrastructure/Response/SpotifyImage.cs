using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyImage
    {
        [JsonPropertyName("url")]
        public string Url { get; set; }
    }
}
    
