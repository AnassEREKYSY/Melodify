using System.Net.Http.Headers;
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
        private readonly UserManager<AppUser> _userManager;
        private readonly HttpClient _httpClient;
        private readonly IUserService _userService;


        public SpotifyAuthService( UserManager<AppUser> userManager, HttpClient httpClient, IUserService userService)
        {
            _userManager = userManager;
            _httpClient = httpClient;
            _userService = userService;
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
                { "client_secret", clientSecret },
                { "scope", "user-read-private user-read-email playlist-read-private user-library-read" }
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

        public async Task<AppUser> AuthenticateUserAsync(SpotifyUserProfileResponse userProfile, SpotifyTokenResponse tokenData)
        {
            var user = await _userManager.FindByEmailAsync(userProfile.Email);
            Console.WriteLine($"Trying to find user with email: {userProfile.Email}");
            if (user == null)
            {
                user = new AppUser
                {
                    SpotifyID = userProfile.Id,
                    UserName = userProfile.Email,
                    Email = userProfile.Email,
                    SpotifyAccessToken = tokenData.AccessToken,
                    SpotifyRefreshToken = tokenData.RefreshToken,
                    DisplayName = userProfile.DisplayName ?? "Spotify User",
                    ProfileImageUrl = userProfile.Images?.FirstOrDefault()?.Url ?? string.Empty
                };

                // Generate JWT token
                var jwtToken = _userService.GenerateJwtToken(user);
                user.UserAccessToken = jwtToken;

                // Attempt to create the user
                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                    throw new Exception($"Failed to create user: {errors}");
                }

                await _userManager.AddToRoleAsync(user, "User");
            }
            else
            {
                user.SpotifyAccessToken = tokenData.AccessToken;
                user.SpotifyRefreshToken = tokenData.RefreshToken;
                
                var jwtToken = _userService.GenerateJwtToken(user);
                user.UserAccessToken = jwtToken;

                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
                    throw new Exception($"Failed to update user tokens: {errors}");
                }
            }
            return user;
        }

        public async Task<SpotifyUserProfile> GetSpotifyUserProfileAsync(string accessToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.GetAsync("https://api.spotify.com/v1/me");

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Failed to retrieve Spotify user profile. Status code: {response.StatusCode}. Error: {errorContent}");
            }

            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"URRRRRRRRA: {content}");
            var userProfile = JsonSerializer.Deserialize<SpotifyUserProfile>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return userProfile;
        }

    }
}