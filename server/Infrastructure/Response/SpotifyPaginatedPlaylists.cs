using Core.Dtos;

namespace Infrastructure.Response
{
    public class SpotifyPaginatedPlaylists
    {
        public List<PlaylistDto> Playlists { get; set; }
        public int Total { get; set; }
        public int Limit { get; set; }
        public int Offset { get; set; }
        public string Next { get; set; }
        public string Previous { get; set; }
    }
}