using Core.Entities;

namespace Infrastructure.IServices
{
    public interface IPlaylistSearchService
    {
        Task<List<Playlist>> GetAllPlaylistsByUserIdAsync(string userId);
        Task<List<Song>> SearchSongsAsync(string query);
    }
}