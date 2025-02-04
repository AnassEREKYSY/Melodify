using Core.Dtos;
using Core.Entities;
using Infrastructure.Data;
using Infrastructure.IServices;
using Infrastructure.Response;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class PlaylistService : IPlaylistService
    {
        private readonly HttpClient _httpClient;
        private readonly IUserService _userService;
        private readonly StoreContext _context;

        public PlaylistService(HttpClient httpClient, IUserService userService, StoreContext context)
        {
            _httpClient = httpClient;
            _userService = userService;
            _context = context;
        }

        public async Task<SpotifyPaginatedPlaylists> GetSpotifyPlaylistsByUserIdAsync(string userId, int offset=0, int limit=10)
        {
            try
            {
                var userToken = await _userService.GetUserTokenForSpotify(userId);

                if (string.IsNullOrEmpty(userToken))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

                var url = $"https://api.spotify.com/v1/users/{userId}/playlists?limit={limit}&offset={offset}";

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Failed to retrieve playlists. Status code: {response.StatusCode}. Error: {errorContent}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var playlistResponse = JsonSerializer.Deserialize<SpotifyPlaylistResponse>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (playlistResponse == null || playlistResponse.Items == null)
                {
                    return new SpotifyPaginatedPlaylists
                    {
                        Playlists = new List<Playlist>(),
                        Total = 0,
                        Limit = limit,
                        Offset = offset,
                        Next = null,
                        Previous = null
                    };
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

                return new SpotifyPaginatedPlaylists
                {
                    Playlists = playlists,
                    Total = playlistResponse.Total,
                    Limit = playlistResponse.Limit,
                    Offset = playlistResponse.Offset,
                    Next = playlistResponse.Offset + playlistResponse.Limit < playlistResponse.Total
                        ? $"?offset={playlistResponse.Offset + playlistResponse.Limit}&limit={playlistResponse.Limit}"
                        : null,
                    Previous = playlistResponse.Offset > 0
                        ? $"?offset={Math.Max(0, playlistResponse.Offset - playlistResponse.Limit)}&limit={playlistResponse.Limit}"
                        : null
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while retrieving playlists: {ex.Message}", ex);
            }
        }


        public async Task<List<Playlist>> GetPlaylistsByUserIdAsync(string userId)
        {
            try
            {
                var userToken = await _userService.GetUserToken(userId);

                if (string.IsNullOrEmpty(userToken))
                {
                    throw new Exception("User access token is missing or invalid.");
                }

                var returnedPlaylists = await _context.Playlists
                    .Where(b => b.UserId == userId)
                    .ToListAsync();

                if (returnedPlaylists == null || returnedPlaylists.Count == 0)
                {
                    return null;
                }

                var playlists = returnedPlaylists
                    .Select(p => new Playlist
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Description = p.Description,
                        ExternalUrl = p.ExternalUrl ?? string.Empty,
                        ImageUrls = p.ImageUrls.ToList() ?? new List<string>(),
                        OwnerDisplayName = p.OwnerDisplayName ?? string.Empty, 
                        OwnerUri = p.OwnerUri ?? string.Empty, 
                        Public = p.Public,
                        SnapshotId = p.SnapshotId 
                    }).ToList();
                return playlists;
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while retrieving playlists: {ex.Message}", ex);
            }
        }

        public async Task<Playlist> CreatePlaylistAsync(PlaylistCreateDto playlistCreateDto)
        {
            try
            {
                var playlistData = new
                {
                    playlistCreateDto.Name,
                    playlistCreateDto.Description,
                    @public = playlistCreateDto.isPublic
                };

                var userToken = await _userService.GetUserTokenForSpotify(playlistCreateDto.UserId);

                if (string.IsNullOrEmpty(userToken))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

                var response = await _httpClient.PostAsJsonAsync($"https://api.spotify.com/v1/users/{playlistCreateDto.UserId}/playlists", playlistData);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Failed to create playlist. Status code: {response.StatusCode}. Error: {errorContent}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var playlist = JsonSerializer.Deserialize<Playlist>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return playlist;
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while creating the playlist: {ex.Message}", ex);
            }
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

        public async Task CheckPlaylistsAsync(string userId, List<SpotifyPlaylistItem> spotifyPlaylists)
        {
            var existingPlaylists = await _context.Playlists
                .Where(p => p.UserId == userId)
                .ToListAsync();

            if (existingPlaylists == null || existingPlaylists.Count == 0)
            {
                await InsertPlaylistsAsync(userId, spotifyPlaylists);
            }
            else
            {
                var existingPlaylistIds = existingPlaylists.Select(p => p.Id).ToList();

                var newPlaylists = spotifyPlaylists
                    .Where(p => !existingPlaylistIds.Contains(p.Id))
                    .ToList();

                if (newPlaylists.Count != 0)
                {
                    await InsertPlaylistsAsync(userId, newPlaylists);
                }
            }
        }
        public async Task InsertPlaylistsAsync(string userId, List<SpotifyPlaylistItem> spotifyPlaylists)
        {
            var playlistsToInsert = spotifyPlaylists.Select(p => new Playlist
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                ExternalUrl = p.ExternalUrls?.Spotify,  
                UserId = userId, 
                Public = p.Public,
                SnapshotId = p.SnapshotId
            }).ToList();

            await _context.Playlists.AddRangeAsync(playlistsToInsert);
            await _context.SaveChangesAsync();
        }

    }
}
