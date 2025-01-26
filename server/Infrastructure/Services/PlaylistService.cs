using Core.Entities;
using Infrastructure.IServices;
using Infrastructure.Response;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class PlaylistService : IPlaylistService
    {
        private readonly HttpClient _httpClient;
        private readonly ISpotifyAuthService _spotifyAuthService;

        // Constructor to inject HttpClient
        public PlaylistService(HttpClient httpClient, ISpotifyAuthService spotifyAuthService)
        {
            _httpClient = httpClient;
            _spotifyAuthService = spotifyAuthService;
        }
        public async Task<List<Playlist>> GetPlaylistsByUserIdAsync(string userId)
        {
            try
            {
                var userToken = await _spotifyAuthService.GetUserToken(userId);

                if (string.IsNullOrEmpty(userToken))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

                var response = await _httpClient.GetAsync($"https://api.spotify.com/v1/users/{userId}/playlists");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Failed to retrieve playlists. Status code: {response.StatusCode}. Error: {errorContent}");
                }

                var content = await response.Content.ReadAsStringAsync();

                var playlistResponse = JsonSerializer.Deserialize<SpotifyPlaylistResponse>(content);

                if (playlistResponse == null || playlistResponse.Items == null || playlistResponse.Items.Count == 0)
                {
                    throw new Exception("Received empty or invalid playlist data from Spotify.");
                }

                var playlists = playlistResponse.Items
                    .Where(dto => dto != null)
                    .Select(dto => new Playlist
                    {
                        Id = dto.Id,
                        Name = dto.Name,
                        Description = dto.Description,
                        ExternalUrl = dto.ExternalUrls?.Spotify ?? string.Empty,
                        ImageUrls = dto.Images?.Select(image => image.Url).ToList() ?? new List<string>(),
                        OwnerDisplayName = dto.Owner?.DisplayName ?? string.Empty, 
                        OwnerUri = dto.Owner?.Uri ?? string.Empty, 
                        Public = dto.Public,
                        SnapshotId = dto.SnapshotId 
                    }).ToList();

                return playlists ?? new List<Playlist>();
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while retrieving playlists: {ex.Message}", ex);
            }
        }


        public async Task<Playlist> CreatePlaylistAsync(string userId, string name, string description)
        {
            var playlistData = new
            {
                name,
                description 
            };

            var response = await _httpClient.PostAsJsonAsync($"https://api.spotify.com/v1/users/{userId}/playlists", playlistData);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Failed to retrieve playlists. Status code: {response.StatusCode}. Error: {errorContent}");
            }


            var content = await response.Content.ReadAsStringAsync();
            var playlist = JsonSerializer.Deserialize<Playlist>(content);

            return playlist;
        }

        public async Task<bool> AddSongToPlaylistAsync(string userId, string playlistId, int songId)
        {
            var songUri = $"spotify:track:{songId}";  // Assuming the songId is a track ID

            var addSongData = new
            {
                uris = new[] { songUri }
            };

            var response = await _httpClient.PostAsJsonAsync($"https://api.spotify.com/v1/playlists/{playlistId}/tracks", addSongData);

            return response.IsSuccessStatusCode;
        }

        public async Task<bool> RemoveSongFromPlaylistAsync(string userId, string playlistId, int songId)
        {
            var songUri = $"spotify:track:{songId}";

            var removeSongData = new
            {
                tracks = new[] { new { uri = songUri } }
            };

            // Using HttpClient.SendAsync to send DELETE request with a JSON body
            var requestMessage = new HttpRequestMessage(HttpMethod.Delete, $"https://api.spotify.com/v1/playlists/{playlistId}/tracks")
            {
                Content = new StringContent(JsonSerializer.Serialize(removeSongData), Encoding.UTF8, "application/json")
            };

            var response = await _httpClient.SendAsync(requestMessage);

            return response.IsSuccessStatusCode;
        }
    }
}
