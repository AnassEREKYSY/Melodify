using Core.Entities;
using Infrastructure.IServices;

namespace Infrastructure.Services
{
    public class PlaylistService : IPlaylistService
    {
        private readonly ISpotifyApiService _spotifyApiService;

        public PlaylistService(ISpotifyApiService spotifyApiService)
        {
            _spotifyApiService = spotifyApiService;
        }

        public async Task<List<Playlist>> GetPlaylistsByUserIdAsync(string userId)
        {
            // Call Spotify API to fetch playlists for the user
            return await _spotifyApiService.GetUserPlaylistsAsync(userId);
        }

        public async Task<Playlist> CreatePlaylistAsync(string userId, string name, string description)
        {
            // Create a new playlist via Spotify API
            return await _spotifyApiService.CreatePlaylistAsync(userId, name, description);
        }

        public async Task<bool> AddSongToPlaylistAsync(string userId, string playlistId, int songId)
        {
            // Add a song to the specified playlist
            return await _spotifyApiService.AddSongToPlaylistAsync(userId, playlistId, songId);
        }

        public async Task<bool> RemoveSongFromPlaylistAsync(string userId, string playlistId, int songId)
        {
            // Remove a song from the specified playlist
            return await _spotifyApiService.RemoveSongFromPlaylistAsync(userId, playlistId, songId);
        }
    }

}
