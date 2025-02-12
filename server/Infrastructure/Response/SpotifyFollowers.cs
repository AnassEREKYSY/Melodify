using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyFollowers
    {
        [JsonPropertyName("total")]
        public int Total { get; set; }

    }
}