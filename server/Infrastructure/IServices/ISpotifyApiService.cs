using Core.Entities;

namespace Infrastructure.IServices
{
    public interface ISpotifyApiService
    {
        Task<List<Playlist>> GetUserPlaylistsAsync(string userId);
        Task<Playlist> CreatePlaylistAsync(string userId, string name, string description);
        Task<bool> AddSongToPlaylistAsync(string userId, string playlistId, int songId);
        Task<bool> RemoveSongFromPlaylistAsync(string userId, string playlistId, int songId);
        Task<List<Song>> GetUserFavoriteSongsAsync(string userId);
        Task<List<Song>> SearchSongsAsync(string query);
        Task<bool> AddSongToFavoritesAsync(string userId, int songId);
        Task<bool> RemoveSongFromFavoritesAsync(string userId, int songId);
    }
}