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
    public class PlaylistService(HttpClient _httpClient, IUserService _userService, StoreContext _context) : IPlaylistService
    {
        public async Task<SpotifyPaginatedPlaylists> GetSpotifyPlaylistsByUserIdAsync(string userId, int offset = 0, int limit = 10)
        {
            try
            {
                var userToken = await _userService.GetUserTokenForSpotify(userId);

                if (string.IsNullOrEmpty(userToken))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

                // Get user's playlists
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
                        Playlists = new List<PlaylistDto>(),
                        Total = 0,
                        Limit = limit,
                        Offset = offset,
                        Next = null,
                        Previous = null
                    };
                }

                // Fetch songs for each playlist
                var playlists = new List<PlaylistDto>();
                foreach (var dto in playlistResponse.Items.Where(dto => dto != null))
                {
                    var songs = await GetSongsForPlaylist(dto.Id, userToken);

                    var playlistDto = new PlaylistDto
                    {
                        Id = dto.Id,
                        Name = dto.Name,
                        Description = dto.Description,
                        ExternalUrl = dto.ExternalUrls?.Spotify ?? string.Empty,
                        ImageUrls = dto.Images?.Select(image => image.Url).ToList() ?? new List<string>(),
                        OwnerDisplayName = dto.Owner?.DisplayName ?? string.Empty,
                        OwnerUri = dto.Owner?.Uri ?? string.Empty,
                        isPublic = dto.Public,
                        SnapshotId = dto.SnapshotId,
                        Songs = songs
                    };

                    playlists.Add(playlistDto);
                }

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

        public async Task<PlaylistDto> CreatePlaylistAsync(PlaylistCreateDto playlistCreateDto)
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
                var playlist = JsonSerializer.Deserialize<PlaylistDto>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return playlist;
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while creating the playlist: {ex.Message}", ex);
            }
        }

        public async Task<bool> AddSongToPlaylistAsync(SongCreateDto songDto)
        {
            try
            {
                var songUri = $"spotify:track:{songDto.SongId}";  

                var addSongData = new
                {
                    uris = new[] { songUri }
                };

                var userToken = await _userService.GetUserTokenForSpotify(songDto.UserId);

                if (string.IsNullOrEmpty(userToken))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

                var response = await _httpClient.PostAsJsonAsync($"https://api.spotify.com/v1/playlists/{songDto.PlaylistId}/tracks", addSongData);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Failed to add song to playlist. Status code: {response.StatusCode}. Error: {errorContent}");
                }

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while adding the song: {ex.Message}", ex);
            }
        }

        public async Task<bool> RemoveSongFromPlaylistAsync(SongCreateDto songDto)
        {
            try
            {
                var userToken = await _userService.GetUserTokenForSpotify(songDto.UserId);
                if (string.IsNullOrEmpty(userToken))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

                var removeSongData = new
                {
                    tracks = new[]
                    {
                        new { uri = $"spotify:track:{songDto.SongId}" }
                    }
                };

                var requestMessage = new HttpRequestMessage(HttpMethod.Delete, $"https://api.spotify.com/v1/playlists/{songDto.PlaylistId}/tracks")
                {
                    Content = new StringContent(JsonSerializer.Serialize(removeSongData), Encoding.UTF8, "application/json")
                };

                var response = await _httpClient.SendAsync(requestMessage);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Failed to remove song. Status code: {response.StatusCode}. Error: {errorContent}");
                }

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while removing the song: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeletePlaylistAsync(string userId, string playlistId)
        {
            try
            {
                var userToken = await _userService.GetUserTokenForSpotify(userId);

                if (string.IsNullOrEmpty(userToken))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

                var requestUri = $"https://api.spotify.com/v1/playlists/{playlistId}/followers";
                var response = await _httpClient.DeleteAsync(requestUri);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Failed to delete (unfollow) playlist. Status code: {response.StatusCode}. Error: {errorContent}");
                }

                return true; 
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while deleting the playlist: {ex.Message}", ex);
            }
        }

        private async Task<List<SongDto>> GetSongsForPlaylist(string playlistId, string accessToken)
        {
            var songs = new List<SongDto>();

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var url = $"https://api.spotify.com/v1/playlists/{playlistId}/tracks";
            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                return songs; 
            }

            var content = await response.Content.ReadAsStringAsync();
            var trackResponse = JsonSerializer.Deserialize<SpotifyPlaylistTracksResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (trackResponse?.Items == null) return songs;

            foreach (var item in trackResponse.Items)
            {
                var track = item.Track;
                if (track != null)
                {
                    songs.Add(new SongDto
                    {
                        Id = track.Id,
                        Name = track.Name,
                        DurationMs = track.DurationMs,
                        Album = new AlbumDto { Name = track.Album?.Name ?? string.Empty },
                        Artists = track.Artists?.Select(a => new ArtistDto { Name = a.Name }).ToList() ?? new List<ArtistDto>()
                    });
                }
            }

            return songs;
        }

    }
}
