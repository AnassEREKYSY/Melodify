using Core.Dtos;

namespace Infrastructure.Response
{
    public class SpotifyShows
    {
        public List<ShowDto> Items { get; set; }
        public int Total { get; set; }
    }
}
