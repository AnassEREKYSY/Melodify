using Core.Entities;
using Infrastructure.IServices;
using Infrastructure.Response;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class SongService : ISongService
    {
        private readonly HttpClient _httpClient;
        private readonly IUserService _userService;

        // Constructor to inject HttpClient
        public SongService(HttpClient httpClient,IUserService userService)
        {
            _httpClient = httpClient;
            _userService = userService;
        }

        // public async Task<List<Song>> GetFavoriteSongsAsync(string userId)
        // {
        //     var response = await _httpClient.GetAsync($"https://api.spotify.com/v1/me/top/tracks?limit=50");  // Adjust endpoint as necessary

        //     if (!response.IsSuccessStatusCode)
        //     {
        //         throw new Exception("Failed to retrieve favorite songs.");
        //     }

        //     var content = await response.Content.ReadAsStringAsync();
        //     var songs = JsonSerializer.Deserialize<List<Song>>(content);

        //     return songs;
        // }

        // public async Task<List<Song>> SearchSongsAsync(string query)
        // {
        //     var response = await _httpClient.GetAsync($"https://api.spotify.com/v1/search?q={query}&type=track&limit=10");

        //     if (!response.IsSuccessStatusCode)
        //     {
        //         throw new Exception("Failed to search for songs.");
        //     }

        //     var content = await response.Content.ReadAsStringAsync();
        //     var searchResults = JsonSerializer.Deserialize<SearchResult>(content);  // Assuming SearchResult is a class for parsing the API response

        //     return searchResults.Tracks.Items;  // Assuming Tracks.Items contains the list of songs
        // }

        // public async Task<bool> AddSongToFavoritesAsync(string userId, int songId)
        // {
        //     var songUri = $"spotify:track:{songId}";

        //     var addSongData = new
        //     {
        //         uris = new[] { songUri }
        //     };

        //     var response = await _httpClient.PostAsJsonAsync("https://api.spotify.com/v1/me/favorites", addSongData);

        //     return response.IsSuccessStatusCode;
        // }

        // public async Task<bool> RemoveSongFromFavoritesAsync(string userId, int songId)
        // {
        //     var songUri = $"spotify:track:{songId}";

        //     var removeSongData = new
        //     {
        //         tracks = new[] { new { uri = songUri } }
        //     };

        //     // Using HttpClient.SendAsync to send DELETE request with a JSON body
        //     var requestMessage = new HttpRequestMessage(HttpMethod.Delete, "https://api.spotify.com/v1/me/favorites")
        //     {
        //         Content = new StringContent(JsonSerializer.Serialize(removeSongData), System.Text.Encoding.UTF8, "application/json")
        //     };

        //     var response = await _httpClient.SendAsync(requestMessage);

        //     return response.IsSuccessStatusCode;
        // }

        public async Task<List<Song>> GetSpotifySavedSongsByUserIdAsync(string userId)
        {
            try
            {
                // Retrieve the Spotify token for the user
                var userToken = await _userService.GetUserTokenForSpotify(userId);

                if (string.IsNullOrEmpty(userToken))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

                var response = await _httpClient.GetAsync("https://api.spotify.com/v1/me/tracks?limit=50");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Failed to retrieve songs. Status code: {response.StatusCode}. Error: {errorContent}");
                }

                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Songs******: {content}");
                var savedSongsResponse = JsonSerializer.Deserialize<SpotifySavedSongsResponse>(content);

                if (savedSongsResponse == null || savedSongsResponse.Items == null || savedSongsResponse.Items.Count == 0)
                {
                    throw new Exception("Received empty or invalid song data from Spotify.");
                }

                var songs = savedSongsResponse.Items
                    .Where(item => item.Track != null)
                    .Select(item => new Song
                    {
                        Id = item.Track.Id.GetHashCode(),
                        Title = item.Track.Name,
                        Artist = string.Join(", ", item.Track.Artists.Select(artist => artist.Name)),
                        Album = item.Track.Album.Name,
                        Duration = TimeSpan.FromMilliseconds(item.Track.DurationMs).ToString(@"mm\:ss")
                    })
                    .ToList();

                return songs;
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while retrieving saved songs: {ex.Message}", ex);
            }
        }

        public async Task<SpotifyTracks> SearchSongsAsync(string userId, string query, int offset = 0, int limit = 10)
        {
            try
            {
                var userToken = await _userService.GetUserTokenForSpotify(userId);

                if (string.IsNullOrEmpty(userToken))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

                var searchUrl = $"https://api.spotify.com/v1/search?q={Uri.EscapeDataString(query)}&type=track&limit={limit}&offset={offset}";

                var response = await _httpClient.GetAsync(searchUrl);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Failed to search for songs. Status code: {response.StatusCode}. Error: {errorContent}");
                }

                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Spotify API Response: {content}");
                var searchResult = JsonSerializer.Deserialize<SpotifySearchResult>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (searchResult?.Tracks?.Items == null || searchResult.Tracks.Items.Count == 0)
                {
                    Console.WriteLine("No songs found after deserialization.");
                    return new SpotifyTracks
                    {
                        Items = new List<SpotifyTrack>(),
                        Total = searchResult?.Tracks?.Total ?? 0,
                        Offset = offset,
                        Limit = limit,
                        Next = null,
                        Previous = null
                    };
                }

                return new SpotifyTracks
                {
                    Items = searchResult.Tracks.Items,
                    Total = searchResult.Tracks.Total,
                    Offset = searchResult.Tracks.Offset,
                    Limit = searchResult.Tracks.Limit,
                    Next = searchResult.Tracks.Next,
                    Previous = searchResult.Tracks.Previous
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while searching for songs: {ex.Message}", ex);
            }
        }

    }
}
