using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyTrackReponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("duration_ms")]
        public int DurationMs { get; set; }

        [JsonPropertyName("preview_url")]
        public string PreviewUrl { get; set; }

        [JsonPropertyName("album")]
        public SpotifyAlbum Album { get; set; }

        [JsonPropertyName("popularity")]
        public int Popularity { get; set; }

        [JsonPropertyName("artists")]
        public List<SpotifyArtist> Artists { get; set; }
    }
}