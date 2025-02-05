using System.Text.Json.Serialization;

namespace Infrastructure.Response
{

    public class SpotifyPlaylistTrackItem
    {
        [JsonPropertyName("track")]
        public SpotifyTrackReponse Track { get; set; }
    }
}