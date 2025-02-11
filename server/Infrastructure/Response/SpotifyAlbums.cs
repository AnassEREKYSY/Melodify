using Core.Dtos;

namespace Infrastructure.Response
{
    public class SpotifyAlbums
    {
        public List<AlbumDto> Items { get; set; }
        public int Total { get; set; }
    }
}
