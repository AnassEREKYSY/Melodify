using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyFollowedArtistDetails
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        
        [JsonPropertyName("name")]
        public string Name { get; set; }
        
        [JsonPropertyName("images")]
        public List<SpotifyFollowedArtistImage> Images { get; set; }
        
        [JsonPropertyName("type")]
        public string Type { get; set; }

        public string ImageUrl { get; set; }
    }

}