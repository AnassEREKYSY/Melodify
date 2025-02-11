using Core.Dtos;

namespace Infrastructure.Response
{
    public class SpotifyArtists
    {
        public List<ArtistDto> Items { get; set; }
        public int Total { get; set; }
    }
}
