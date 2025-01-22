using System.Text.Json;
using Core.Entities;
using Infrastructure.IServices;
using Infrastructure.Response;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services
{

    public class SpotifyAuthService : ISpotifyAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<AppUser> _userManager;
        private readonly HttpClient _httpClient;

        public SpotifyAuthService(IConfiguration configuration, UserManager<AppUser> userManager, HttpClient httpClient)
        {
            _configuration = configuration;
            _userManager = userManager;
            _httpClient = httpClient;
        }

        public string GetLoginUrl()
        {
            var clientId = _configuration["Spotify:ClientId"];
            var redirectUri = _configuration["Spotify:RedirectUri"];
            var scope = "user-read-private user-read-email playlist-read-private";
            var state = Guid.NewGuid().ToString();

            return $"https://accounts.spotify.com/authorize?client_id={clientId}&response_type=code&redirect_uri={Uri.EscapeDataString(redirectUri)}&scope={Uri.EscapeDataString(scope)}&state={state}";
        }

        public async Task<SpotifyTokenResponse> ExchangeCodeForTokenAsync(string code)
        {
            var clientId = _configuration["Spotify:ClientId"];
            var clientSecret = _configuration["Spotify:ClientSecret"];
            var redirectUri = _configuration["Spotify:RedirectUri"];

            var tokenRequest = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token")
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    { "grant_type", "authorization_code" },
                    { "code", code },
                    { "redirect_uri", redirectUri },
                    { "client_id", clientId },
                    { "client_secret", clientSecret }
                })
            };

            var tokenResponse = await _httpClient.SendAsync(tokenRequest);
            tokenResponse.EnsureSuccessStatusCode();

            var tokenResponseBody = await tokenResponse.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<SpotifyTokenResponse>(tokenResponseBody);
        }

        public async Task<SpotifyUserProfileResponse> GetUserProfileAsync(string accessToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            var userProfileResponse = await _httpClient.GetAsync("https://api.spotify.com/v1/me");
            userProfileResponse.EnsureSuccessStatusCode();

            var userProfileBody = await userProfileResponse.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<SpotifyUserProfileResponse>(userProfileBody);
        }

        public async Task<AppUser> AuthenticateUserAsync(SpotifyUserProfileResponse userProfile, SpotifyTokenResponse tokenData)
        {
            var user = await _userManager.FindByEmailAsync(userProfile.Email);
            if (user == null)
            {
                user = new AppUser
                {
                    UserName = userProfile.Email,
                    Email = userProfile.Email,
                    SpotifyAccessToken = tokenData.AccessToken,
                    SpotifyRefreshToken = tokenData.RefreshToken,
                    DisplayName = userProfile.DisplayName ?? "Spotify User",
                    ProfileImageUrl = userProfile.Images?.FirstOrDefault()?.Url ?? string.Empty
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    throw new Exception($"Failed to create user: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
                }
            }
            else
            {
                user.SpotifyAccessToken = tokenData.AccessToken;
                user.SpotifyRefreshToken = tokenData.RefreshToken;

                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    throw new Exception($"Failed to update user tokens: {string.Join(", ", updateResult.Errors.Select(e => e.Description))}");
                }
            }

            return user;
        }
    }
}