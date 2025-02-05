using Core.Dtos;
using Core.Entities;
using Infrastructure.Response;

namespace Infrastructure.IServices
{
    public interface IPlaylistService
    {
        Task<SpotifyPaginatedPlaylists> GetSpotifyPlaylistsByUserIdAsync(string userId, int offset=0, int limit=10);
        Task<PlaylistDto> CreatePlaylistAsync(PlaylistCreateDto playlistCreateDto);
        Task<bool> DeletePlaylistAsync(string userId, string playlistId);
        Task<bool> AddSongToPlaylistAsync(SongCreateDto songDto);
        Task<bool> RemoveSongFromPlaylistAsync(SongCreateDto songDto);
    }
}