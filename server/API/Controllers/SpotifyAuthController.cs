using System.Text.Json;
using Core.Entities;
using Infrastructure.Response;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/spotify-auth")]
    public class SpotifyAuthController: ControllerBase
    {

        private readonly IConfiguration _configuration;
        private readonly UserManager<AppUser> _userManager;

        public SpotifyAuthController(IConfiguration configuration, UserManager<AppUser> userManager)
        {
            _configuration = configuration;
            _userManager = userManager;
        }
        [HttpGet("login")]
        public IActionResult Login()
        {
            var clientId = _configuration["Spotify:ClientId"];
            var redirectUri = _configuration["Spotify:RedirectUri"];
            var scope = "user-read-private user-read-email playlist-read-private";
            var state = Guid.NewGuid().ToString();

            var authUrl = $"https://accounts.spotify.com/authorize?client_id={clientId}&response_type=code&redirect_uri={Uri.EscapeDataString(redirectUri)}&scope={Uri.EscapeDataString(scope)}&state={state}";

            return Redirect(authUrl);
        }

[HttpGet("callback")]
public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state)
{
    var clientId = _configuration["Spotify:ClientId"];
    var clientSecret = _configuration["Spotify:ClientSecret"];
    var redirectUri = _configuration["Spotify:RedirectUri"];

    using var httpClient = new HttpClient();

    // Request tokens from Spotify
    var request = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token");
    request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
    {
        { "grant_type", "authorization_code" },
        { "code", code },
        { "redirect_uri", redirectUri },
        { "client_id", clientId },
        { "client_secret", clientSecret }
    });

    var response = await httpClient.SendAsync(request);
    response.EnsureSuccessStatusCode();
    var responseBody = await response.Content.ReadAsStringAsync();
    var tokenData = JsonSerializer.Deserialize<SpotifyTokenResponse>(responseBody);

    // Use the access token to fetch user information from Spotify
    httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenData.AccessToken);
    var userProfileResponse = await httpClient.GetAsync("https://api.spotify.com/v1/me");
    userProfileResponse.EnsureSuccessStatusCode();
    var userProfileBody = await userProfileResponse.Content.ReadAsStringAsync();
    var userProfile = JsonSerializer.Deserialize<SpotifyUserProfileResponse>(userProfileBody);

    // Check if the user exists in the database
    var user = await _userManager.FindByEmailAsync(userProfile.Email);
    if (user == null)
    {
        // Create a new user
        user = new AppUser
        {
            UserName = userProfile.DisplayName,
            Email = userProfile.Email,
            SpotifyAccessToken = tokenData.AccessToken,
            SpotifyRefreshToken = tokenData.RefreshToken,
            DisplayName = userProfile.DisplayName,
            ProfileImageUrl = userProfile.Images?.FirstOrDefault()?.Url ?? string.Empty
        };

        var result = await _userManager.CreateAsync(user);
        if (!result.Succeeded)
        {
            return StatusCode(500, "Failed to create user.");
        }
    }
    else
    {
        // Update existing user's tokens
        user.SpotifyAccessToken = tokenData.AccessToken;
        user.SpotifyRefreshToken = tokenData.RefreshToken;
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return StatusCode(500, "Failed to update user.");
        }
    }

    return Ok(new { message = "User authenticated successfully.", user });
}

    }
}