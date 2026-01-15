using System.Net.Http.Headers;
using System.Text.Json;
using Core.Entities;
using Infrastructure.IServices;
using Infrastructure.Response;

namespace Infrastructure.Services
{
    public class SpotifyAuthService : ISpotifyAuthService
    {
        private readonly HttpClient _httpClient;

        public SpotifyAuthService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public string GetLoginUrl()
        {
            var clientId = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_ID");
            var redirectUri = Environment.GetEnvironmentVariable("SPOTIFY_REDIRECT_URI");
            var scope = "user-read-private user-read-email playlist-read-private user-library-read playlist-modify-public playlist-modify-private user-follow-modify user-follow-read";
            var state = Guid.NewGuid().ToString();

            return $"https://accounts.spotify.com/authorize?client_id={clientId}&response_type=code&redirect_uri={Uri.EscapeDataString(redirectUri)}&scope={Uri.EscapeDataString(scope)}&state={state}&show_dialog=true";
        }

        public async Task<SpotifyTokenResponse> ExchangeCodeForTokenAsync(string code)
        {
            var clientId = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_ID");
            var clientSecret = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_SECRET");
            var redirectUri = Environment.GetEnvironmentVariable("SPOTIFY_REDIRECT_URI");

            var tokenRequestContent = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "grant_type", "authorization_code" },
                { "code", code },
                { "redirect_uri", redirectUri },
                { "client_id", clientId },
                { "client_secret", clientSecret }
            });

            var tokenRequest = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token")
            {
                Content = tokenRequestContent
            };

            var tokenResponse = await _httpClient.SendAsync(tokenRequest);
            tokenResponse.EnsureSuccessStatusCode();

            var tokenResponseBody = await tokenResponse.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<SpotifyTokenResponse>(tokenResponseBody);
        }

        public async Task<SpotifyUserProfile> GetSpotifyUserProfileAsync(string accessToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.GetAsync("https://api.spotify.com/v1/me");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<SpotifyUserProfile>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
    }
}
