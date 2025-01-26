using Core.Entities;
using Infrastructure.Response;

namespace Infrastructure.IServices
{
    public interface IPlaylistService
    {
        Task<List<Playlist>> GetSpotifyPlaylistsByUserIdAsync(string userId);
        Task<List<Playlist>> GetPlaylistsByUserIdAsync(string userId);
        Task<Playlist> CreatePlaylistAsync(string userId, string name, string description);
        Task<bool> AddSongToPlaylistAsync(string userId, string playlistId, int songId);
        Task<bool> RemoveSongFromPlaylistAsync(string userId, string playlistId, int songId);
        Task CheckPlaylistsAsync(string userId, List<SpotifyPlaylistItem> spotifyPlaylists);
        Task InsertPlaylistsAsync(string userId, List<SpotifyPlaylistItem> spotifyPlaylists);
    }
}