using Core.Entities;

namespace Infrastructure.Response
{
    public class SpotifyPaginatedPlaylists
    {
        public List<Playlist> Playlists { get; set; }
        public int Total { get; set; }
        public int Limit { get; set; }
        public int Offset { get; set; }
        public string Next { get; set; }
        public string Previous { get; set; }
    }
}