using Core.Entities;

namespace Infrastructure.IServices
{
    public interface IPlaylistService
    {
        Task<IEnumerable<Playlist>> GetAllPlaylistsAsync();
        Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(string userId);
        Task<Playlist?> GetPlaylistByIdAsync(int id);
        Task<Playlist> CreatePlaylistAsync(Playlist playlist);
        Task<Playlist?> UpdatePlaylistAsync(int id, Playlist updatedPlaylist);
        Task<bool> DeletePlaylistAsync(int id);
        Task<bool> AddSongToPlaylistAsync(int playlistId, Song song);
        Task<bool> RemoveSongFromPlaylistAsync(int playlistId, int songId);
    }
}