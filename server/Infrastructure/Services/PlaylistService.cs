using Core.Entities;
using Infrastructure.IServices;

namespace Infrastructure.Services
{
    public class PlaylistService : IPlaylistService
    {
        private readonly List<Playlist> _playlists;

        public PlaylistService()
        {
            _playlists = [];
        }

        public async Task<IEnumerable<Playlist>> GetAllPlaylistsAsync()
        {
            return await Task.FromResult(_playlists);
        }

        public async Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(string userId)
        {
            var userPlaylists = _playlists.Where(p => p.UserId == userId).ToList();
            return await Task.FromResult(userPlaylists);
        }

        public async Task<Playlist?> GetPlaylistByIdAsync(int id)
        {
            var playlist = _playlists.FirstOrDefault(p => p.Id == id);
            return await Task.FromResult(playlist);
        }

        public async Task<Playlist> CreatePlaylistAsync(Playlist playlist)
        {
            playlist.Id = _playlists.Any() ? _playlists.Max(p => p.Id) + 1 : 1;
            _playlists.Add(playlist);
            return await Task.FromResult(playlist);
        }

        public async Task<Playlist?> UpdatePlaylistAsync(int id, Playlist updatedPlaylist)
        {
            var existingPlaylist = _playlists.FirstOrDefault(p => p.Id == id);
            if (existingPlaylist == null) return null;

            existingPlaylist.Name = updatedPlaylist.Name;
            existingPlaylist.Description = updatedPlaylist.Description;
            existingPlaylist.Songs = updatedPlaylist.Songs;

            return await Task.FromResult(existingPlaylist);
        }

        public async Task<bool> DeletePlaylistAsync(int id)
        {
            var playlist = _playlists.FirstOrDefault(p => p.Id == id);
            if (playlist == null) return await Task.FromResult(false);

            _playlists.Remove(playlist);
            return await Task.FromResult(true);
        }

        public async Task<bool> AddSongToPlaylistAsync(int playlistId, Song song)
        {
            var playlist = _playlists.FirstOrDefault(p => p.Id == playlistId);
            if (playlist == null) return await Task.FromResult(false);

            if (!playlist.Songs.Any(s => s.Id == song.Id)) // Avoid duplicates
            {
                playlist.Songs.Add(song);
            }

            return await Task.FromResult(true);
        }

        public async Task<bool> RemoveSongFromPlaylistAsync(int playlistId, int songId)
        {
            var playlist = _playlists.FirstOrDefault(p => p.Id == playlistId);
            if (playlist == null) return await Task.FromResult(false);

            var songToRemove = playlist.Songs.FirstOrDefault(s => s.Id == songId);
            if (songToRemove == null) return await Task.FromResult(false);

            playlist.Songs.Remove(songToRemove);
            return await Task.FromResult(true);
        }
    }
}
