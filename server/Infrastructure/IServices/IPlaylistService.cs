using Core.Dtos;
using Core.Entities;
using Infrastructure.Response;

namespace Infrastructure.IServices
{
    public interface IPlaylistService
    {
        Task<SpotifyPaginatedPlaylists> GetSpotifyPlaylistsByUserIdAsync(string userToken, int offset=0, int limit=10);
        Task<PlaylistDto> CreatePlaylistAsync(PlaylistCreateDto playlistCreateDto, string token);
        Task<bool> DeletePlaylistAsync(string token, string playlistId);
        Task<bool> AddSongToPlaylistAsync(SongCreateDto songDto , string token);
        Task<bool> RemoveSongFromPlaylistAsync(SongCreateDto songDto , string token);
    }
}