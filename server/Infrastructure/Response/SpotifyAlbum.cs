using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyAlbum
    {
         [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("images")]
        public List<SpotifyFollowedArtistImage> Images { get; set; }

        public string ImageUrl => Images?.Count > 0 ? Images[0].Url : null;
    }
}