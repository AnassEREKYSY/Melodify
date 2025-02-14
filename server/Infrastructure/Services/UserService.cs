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

    public class UserService(IConfiguration _configuration, HttpClient _httpClient) : IUserService
    {

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

                return JsonSerializer.Deserialize<SpotifyUserProfileResponse>(userProfileBody);
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

        public async Task<bool> UnfollowArtistAsync(string accessToken, string artistId)
        {
            var requestUrl = "https://api.spotify.com/v1/me/following?type=artist&ids=" + artistId;
            
            var request = new HttpRequestMessage(HttpMethod.Delete, requestUrl);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Successfully unfollowed artist {artistId}");
                return true;
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Failed to unfollow artist {artistId}: {errorContent}");
                return false;
            }
        }

        public async Task<bool> FollowArtistAsync(string accessToken, string artistId)
        {
            var requestUrl = "https://api.spotify.com/v1/me/following?type=artist";
            
            var request = new HttpRequestMessage(HttpMethod.Put, requestUrl);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent(JsonSerializer.Serialize(new { ids = new[] { artistId } }), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);

            return response.IsSuccessStatusCode;
        }

    
    }
}