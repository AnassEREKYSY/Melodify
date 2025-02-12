using System.Net.Http.Headers;
using System.Text.Json;
using Infrastructure.IServices;
using Infrastructure.Response;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    public class ArtistService(HttpClient httpClient): IArtistService
    {
        private readonly HttpClient _httpClient = httpClient;

        public async Task<SpotifyArtistDetails?> GetArtistByIdAsync(string accessToken, string artistId)
        {
            var requestUrl = $"https://api.spotify.com/v1/artists/{artistId}";

            var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to fetch artist {artistId}: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Artist Response: {content}");

            return JsonSerializer.Deserialize<SpotifyArtistDetails>(content);
        }

        public async Task<List<SpotifyTrackReponse>?> GetArtistTopSongsAsync(string accessToken, string artistId, string market = "US")
        {
            var requestUrl = $"https://api.spotify.com/v1/artists/{artistId}/top-tracks?market={market}";

            var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to fetch top songs for artist {artistId}: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Artist Top Songs Response: {content}");

            var result = JsonSerializer.Deserialize<SpotifyArtistTopTracksResponse>(content);
            return result?.Tracks;
        }
    }
}
