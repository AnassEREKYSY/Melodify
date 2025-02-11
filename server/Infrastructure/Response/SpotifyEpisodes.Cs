using Core.Dtos;

namespace Infrastructure.Response
{
    public class SpotifyEpisodes
    {
        public List<EpisodeDto> Items { get; set; }
        public int Total { get; set; }
    }
}
