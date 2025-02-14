using Core.Dtos;
using Infrastructure.IServices;
using Infrastructure.Response;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class PlaylistService(HttpClient _httpClient, IUserService _userService, ISpotifyAuthService _spotifyAuthService) : IPlaylistService
    {
        public async Task<SpotifyPaginatedPlaylists> GetSpotifyPlaylistsByUserIdAsync(string userToken, int offset = 0, int limit = 10)
        {
            try
            {
                if (string.IsNullOrEmpty(userToken))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                var user = await _spotifyAuthService.GetSpotifyUserProfileAsync(userToken) ?? throw new Exception("User doesnt exist.");
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

                var url = $"https://api.spotify.com/v1/users/{user.Id}/playlists?limit={limit}&offset={offset}";
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

        public async Task<PlaylistDto> CreatePlaylistAsync(PlaylistCreateDto playlistCreateDto, string token)
        {
            try
            {
                var playlistData = new
                {
                    playlistCreateDto.Name,
                    playlistCreateDto.Description,
                    @public = playlistCreateDto.isPublic
                };

                if (string.IsNullOrEmpty(token))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

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

        public async Task<bool> AddSongToPlaylistAsync(SongCreateDto songDto ,  string token)
        {
            try
            {
                var songUri = $"spotify:track:{songDto.SongId}";  

                var addSongData = new
                {
                    uris = new[] { songUri }
                };

                if (string.IsNullOrEmpty(token))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

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

        public async Task<bool> RemoveSongFromPlaylistAsync(SongCreateDto songDto, string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

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

        public async Task<bool> DeletePlaylistAsync(string token, string playlistId)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

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

        public async Task<List<SongDto>> GetSongsForPlaylist(string playlistId, string accessToken)
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
                        Album = new AlbumDto { 
                            Name = track.Album?.Name ?? string.Empty,
                            ImageUrl = track.Album?.Images[0].Url ?? string.Empty,
                        },
                        Popularity = track.Popularity,
                        Artists = track.Artists?.Select(a => new ArtistDto { Name = a.Name }).ToList() ?? new List<ArtistDto>()
                    });
                }
            }

            return songs;
        }

        public async Task<PlaylistDto> GetPlaylistByIdAsync(string playlistId, string accessToken)
        {
            try
            {
                if (string.IsNullOrEmpty(accessToken))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var url = $"https://api.spotify.com/v1/playlists/{playlistId}";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Failed to retrieve playlist. Status code: {response.StatusCode}. Error: {errorContent}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var playlistResponse = JsonSerializer.Deserialize<SpotifyPlaylistItem>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? throw new Exception("Failed to deserialize playlist response.");
                var songs = await GetSongsForPlaylist(playlistId, accessToken);

                return new PlaylistDto
                {
                    Id = playlistResponse.Id,
                    Name = playlistResponse.Name,
                    Description = playlistResponse.Description,
                    ExternalUrl = playlistResponse.ExternalUrls?.Spotify ?? string.Empty,
                    ImageUrls = playlistResponse.Images?.Select(image => image.Url).ToList() ?? new List<string>(),
                    OwnerDisplayName = playlistResponse.Owner?.DisplayName ?? string.Empty,
                    OwnerUri = playlistResponse.Owner?.Uri ?? string.Empty,
                    isPublic = playlistResponse.Public,
                    SnapshotId = playlistResponse.SnapshotId,
                    Songs = songs
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while retrieving the playlist: {ex.Message}", ex);
            }
        }

    }
}
