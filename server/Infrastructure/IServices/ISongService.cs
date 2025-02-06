using Core.Entities;
using Infrastructure.Response;
namespace Infrastructure.IServices
{
    public interface ISongService
    {
        Task<SpotifyTracks> SearchSongsAsync(string token, string query, int offset = 0, int limit = 10);
    }

}
