using Core.Dtos;

namespace Infrastructure.Response
{
    public class SpotifyTracks
    {
        public List<SongDto> Items { get; set; }
        public int Total { get; set; }
        public string Next { get; set; }
        public string Previous { get; set; }
        public int Limit { get; set; }
        public int Offset { get; set; }
    }
}