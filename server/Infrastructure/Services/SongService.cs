using Core.Dtos;
using Core.Entities;
using Infrastructure.IServices;
using Infrastructure.Response;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class SongService(HttpClient _httpClient, IUserService _userService) : ISongService
    {
        public async Task<SpotifyTracks> SearchSongsAsync(string token, string query, int offset = 0, int limit = 10)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    throw new Exception("Spotify access token is missing or invalid.");
                }

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

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
                        Items = new List<SongDto>(),
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
