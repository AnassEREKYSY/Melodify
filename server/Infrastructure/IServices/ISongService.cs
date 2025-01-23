using Core.Entities;
namespace Infrastructure.IServices
{
    public interface ISongService
    {
        Task<List<Song>> GetFavoriteSongsAsync(string userId);
        Task<List<Song>> SearchSongsAsync(string query);
        Task<bool> AddSongToFavoritesAsync(string userId, int songId);
        Task<bool> RemoveSongFromFavoritesAsync(string userId, int songId);
    }

}
