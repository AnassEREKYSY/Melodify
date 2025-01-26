using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class PlaylistOwner
    {
        [JsonPropertyName("display_name")]
        public string DisplayName { get; set; }

        [JsonPropertyName("uri")]
        public string Uri { get; set; }
    }
}