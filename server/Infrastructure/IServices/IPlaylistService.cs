using Core.Entities;

namespace Infrastructure.IServices
{
    public interface IPlaylistService
    {
        Task<List<Playlist>> GetPlaylistsByUserIdAsync(string userId);
        Task<Playlist> CreatePlaylistAsync(string userId, string name, string description);
        Task<bool> AddSongToPlaylistAsync(string userId, string playlistId, int songId);
        Task<bool> RemoveSongFromPlaylistAsync(string userId, string playlistId, int songId);
    }
}