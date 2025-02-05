using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyPlaylistTracksResponse
    {
        [JsonPropertyName("items")]
        public List<SpotifyPlaylistTrackItem> Items { get; set; }
    }
}