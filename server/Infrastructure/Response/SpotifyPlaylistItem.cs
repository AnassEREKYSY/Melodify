using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyPlaylistItem
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("external_urls")]
        public ExternalUrls ExternalUrls { get; set; }

        [JsonPropertyName("images")]
        public List<SpotifyImage> Images { get; set; }

        [JsonPropertyName("owner")]
        public PlaylistOwner Owner { get; set; }

        [JsonPropertyName("public")]
        public bool Public { get; set; }

        [JsonPropertyName("snapshot_id")]
        public string SnapshotId { get; set; }
    }
}