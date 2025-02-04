using Core.Dtos;
using Core.Entities;
using Infrastructure.Response;

namespace Infrastructure.IServices
{
    public interface IPlaylistService
    {
        Task<SpotifyPaginatedPlaylists> GetSpotifyPlaylistsByUserIdAsync(string userId, int offset=0, int limit=10);
        Task<List<Playlist>> GetPlaylistsByUserIdAsync(string userId);
        Task<Playlist> CreatePlaylistAsync(PlaylistCreateDto playlistCreateDto);
        Task<bool> AddSongToPlaylistAsync(string userId, string playlistId, int songId);
        Task<bool> RemoveSongFromPlaylistAsync(string userId, string playlistId, int songId);
        Task CheckPlaylistsAsync(string userId, List<SpotifyPlaylistItem> spotifyPlaylists);
        Task InsertPlaylistsAsync(string userId, List<SpotifyPlaylistItem> spotifyPlaylists);
    }
}