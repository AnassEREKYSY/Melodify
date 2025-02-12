using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Infrastructure.Response
{
    public class SpotifyArtistTopTracksResponse
    {
        [JsonPropertyName("tracks")]
        public List<SpotifyTrackReponse> Tracks { get; set; }
    }
}