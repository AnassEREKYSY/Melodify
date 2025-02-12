using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyArtistFollowers
    {
        [JsonPropertyName("total")]
        public int Total { get; set; }
    }
}