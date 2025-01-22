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

            try
            {
                var tokenResponse = await _httpClient.SendAsync(tokenRequest);
                tokenResponse.EnsureSuccessStatusCode();

                var tokenResponseBody = await tokenResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"Token Response Body: {tokenResponseBody}");

                return JsonSerializer.Deserialize<SpotifyTokenResponse>(tokenResponseBody);
            }
            catch (HttpRequestException httpEx)
            {
                Console.WriteLine($"HttpRequestException: {httpEx.Message}");
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                throw;
            }
        }

        public async Task<SpotifyUserProfileResponse> GetUserProfileAsync(string accessToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            try
            {
                var userProfileResponse = await _httpClient.GetAsync("https://api.spotify.com/v1/me");
                userProfileResponse.EnsureSuccessStatusCode();

                var userProfileBody = await userProfileResponse.Content.ReadAsStringAsync();
                if (string.IsNullOrEmpty(userProfileBody))
                {
                    throw new Exception("User profile response body is empty.");
                }

                // Log the user profile response body
                Console.WriteLine($"User Profile Response Body: {userProfileBody}");

                return JsonSerializer.Deserialize<SpotifyUserProfileResponse>(userProfileBody);
            }
            catch (HttpRequestException httpEx)
            {
                // Log detailed error if the request fails
                Console.WriteLine($"HttpRequestException: {httpEx.Message}");
                throw;
            }
            catch (Exception ex)
            {
                // Log any other exceptions
                Console.WriteLine($"Exception: {ex.Message}");
                throw;
            }
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