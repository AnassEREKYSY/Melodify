using Core.Entities;
using Infrastructure.Response;
namespace Infrastructure.IServices
{
    public interface ISongService
    {
        // Task<List<Song>> GetFavoriteSongsAsync(string userId);
        // Task<List<Song>> SearchSongsAsync(string query);
        // Task<bool> AddSongToFavoritesAsync(string userId, int songId);
        // Task<bool> RemoveSongFromFavoritesAsync(string userId, int songId);
        Task<List<Song>> GetSpotifySavedSongsByUserIdAsync(string userId);
        Task<SpotifyTracks> SearchSongsAsync(string userId, string query, int offset = 0, int limit = 10);
    }

}
