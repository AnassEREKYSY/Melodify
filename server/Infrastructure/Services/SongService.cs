using Core.Entities;
using Infrastructure.IServices;
namespace Infrastructure.Services
{
    public class SongService : ISongService
    {
        private readonly ISpotifyApiService _spotifyApiService;

        public SongService(ISpotifyApiService spotifyApiService)
        {
            _spotifyApiService = spotifyApiService;
        }

        public async Task<List<Song>> GetFavoriteSongsAsync(string userId)
        {
            // Call Spotify API to get favorite songs of the user
            return await _spotifyApiService.GetUserFavoriteSongsAsync(userId);
        }

        public async Task<List<Song>> SearchSongsAsync(string query)
        {
            // Call Spotify API to search for songs based on the query
            return await _spotifyApiService.SearchSongsAsync(query);
        }

        public async Task<bool> AddSongToFavoritesAsync(string userId, int songId)
        {
            // Add song to user's favorites on Spotify
            return await _spotifyApiService.AddSongToFavoritesAsync(userId, songId);
        }

        public async Task<bool> RemoveSongFromFavoritesAsync(string userId, int songId)
        {
            // Remove song from user's favorites on Spotify
            return await _spotifyApiService.RemoveSongFromFavoritesAsync(userId, songId);
        }
    }


}
