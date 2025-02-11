using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Core.Entities;
using Infrastructure.IServices;
using Infrastructure.Mappers;
using Infrastructure.Response;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services
{

    public class UserService : IUserService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<AppUser> _userManager;
        private readonly HttpClient _httpClient;

        public UserService(IConfiguration configuration, UserManager<AppUser> userManager, HttpClient httpClient)
        {
            _configuration = configuration;
            _userManager = userManager;
            _httpClient = httpClient;
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

        public async Task<List<AppUser>> GetAllUsers(){
            return await Task.FromResult(_userManager.Users.ToList());
        }

        public async Task<string> GetUserTokenForSpotify(string userId)
        {
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.SpotifyID == userId) ?? throw new Exception("User not found");
            return user.SpotifyAccessToken;
        }

        public async Task<string> GetUserToken(string userId)
        {
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.Id == userId) ?? throw new Exception("User not found");
            return user.SpotifyAccessToken;
        }

        public async Task<AppUser> GetOneUser(string userId)
        {
             var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.Id == userId) ?? throw new Exception("User not found");
            return user;
        }
    
        public string GenerateJwtToken(AppUser user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
            };

            var key = new SymmetricSecurityKey(Convert.FromBase64String(_configuration["Jwt:SecretKey"]));  // Base64 decode the secret key
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public async Task<List<SpotifyFollowedArtistDetails>> GetFollowedArtistsAsync(string accessToken)
        {
            var allArtists = new List<SpotifyFollowedArtistDetails>();
            var requestUrl = "https://api.spotify.com/v1/me/following?type=artist&limit=50";

            while (!string.IsNullOrEmpty(requestUrl))
            {
                var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Followed Artists Response: {content}");

                var result = JsonSerializer.Deserialize<SpotifyFollowedArtistsResponse>(content);

                if (result?.Artists?.Items != null)
                {
                    allArtists.AddRange(result.Artists.Items);
                }
                requestUrl = result?.Artists?.Next;
            }

            return allArtists;
        }

    
    }
}