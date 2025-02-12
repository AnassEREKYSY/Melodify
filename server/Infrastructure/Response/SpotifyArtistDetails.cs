using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyArtistDetails
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("images")]
        public List<SpotifyFollowedArtistImage> Images { get; set; }

        [JsonPropertyName("genres")]
        public List<string> Genres { get; set; }

        [JsonPropertyName("followers")]
        public SpotifyArtistFollowers Followers { get; set; }

        [JsonPropertyName("popularity")]
        public int Popularity { get; set; }

        public string ImageUrl => Images?.Count > 0 ? Images[0].Url : null;
    }
}