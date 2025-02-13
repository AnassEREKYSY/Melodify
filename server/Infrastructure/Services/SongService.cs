using System.Net.Http.Headers;
using System.Text.Json;
using Infrastructure.IServices;
using Infrastructure.Response;

namespace Infrastructure.Services
{
    public class SongService(HttpClient httpClient): ISongService
    {
        private readonly HttpClient _httpClient = httpClient;

        public async Task<SpotifyTrackReponse?> GetSongByIdAsync(string accessToken, string artistId)
        {
            var requestUrl = $"https://api.spotify.com/v1/tracks/{artistId}";

            var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to fetch artist {artistId}: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Artist Response: {content}");

            return JsonSerializer.Deserialize<SpotifyTrackReponse>(content);
        }

    }
}
