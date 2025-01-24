// using Core.Entities;
// using Infrastructure.IServices;
// using System.Net.Http;
// using System.Net.Http.Json;
// using System.Text.Json;

// namespace Infrastructure.Services
// {
//     public class SongService : ISongService
//     {
//         private readonly HttpClient _httpClient;

//         // Constructor to inject HttpClient
//         public SongService(HttpClient httpClient)
//         {
//             _httpClient = httpClient;
//         }

//         public async Task<List<Song>> GetFavoriteSongsAsync(string userId)
//         {
//             var response = await _httpClient.GetAsync($"https://api.spotify.com/v1/me/top/tracks?limit=50");  // Adjust endpoint as necessary

//             if (!response.IsSuccessStatusCode)
//             {
//                 throw new Exception("Failed to retrieve favorite songs.");
//             }

//             var content = await response.Content.ReadAsStringAsync();
//             var songs = JsonSerializer.Deserialize<List<Song>>(content);

//             return songs;
//         }

//         public async Task<List<Song>> SearchSongsAsync(string query)
//         {
//             var response = await _httpClient.GetAsync($"https://api.spotify.com/v1/search?q={query}&type=track&limit=10");

//             if (!response.IsSuccessStatusCode)
//             {
//                 throw new Exception("Failed to search for songs.");
//             }

//             var content = await response.Content.ReadAsStringAsync();
//             var searchResults = JsonSerializer.Deserialize<SearchResult>(content);  // Assuming SearchResult is a class for parsing the API response

//             return searchResults.Tracks.Items;  // Assuming Tracks.Items contains the list of songs
//         }

//         public async Task<bool> AddSongToFavoritesAsync(string userId, int songId)
//         {
//             var songUri = $"spotify:track:{songId}";

//             var addSongData = new
//             {
//                 uris = new[] { songUri }
//             };

//             var response = await _httpClient.PostAsJsonAsync("https://api.spotify.com/v1/me/favorites", addSongData);

//             return response.IsSuccessStatusCode;
//         }

//         public async Task<bool> RemoveSongFromFavoritesAsync(string userId, int songId)
//         {
//             var songUri = $"spotify:track:{songId}";

//             var removeSongData = new
//             {
//                 tracks = new[] { new { uri = songUri } }
//             };

//             // Using HttpClient.SendAsync to send DELETE request with a JSON body
//             var requestMessage = new HttpRequestMessage(HttpMethod.Delete, "https://api.spotify.com/v1/me/favorites")
//             {
//                 Content = new StringContent(JsonSerializer.Serialize(removeSongData), System.Text.Encoding.UTF8, "application/json")
//             };

//             var response = await _httpClient.SendAsync(requestMessage);

//             return response.IsSuccessStatusCode;
//         }
//     }
// }
