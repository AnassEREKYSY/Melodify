using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyAlbum
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }
    }
}