using System.Text.Json;
using Core.Entities;
using Infrastructure.Response;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/spotify-auth")]
    public class SpotifyAuthController : ControllerBase
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

    HttpResponseMessage tokenResponse;
    try
    {
        tokenResponse = await httpClient.SendAsync(tokenRequest);
        var responseContent = await tokenResponse.Content.ReadAsStringAsync();
        Console.WriteLine($"Token Response: {responseContent}");
        tokenResponse.EnsureSuccessStatusCode();
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Failed to exchange token: {ex.Message}");
    }

    var tokenResponseBody = await tokenResponse.Content.ReadAsStringAsync();
    var tokenData = JsonSerializer.Deserialize<SpotifyTokenResponse>(tokenResponseBody);

    // Fetch user profile from Spotify
    httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenData.AccessToken);
    HttpResponseMessage userProfileResponse;
    try
    {
        userProfileResponse = await httpClient.GetAsync("https://api.spotify.com/v1/me");
        userProfileResponse.EnsureSuccessStatusCode();
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Failed to fetch user profile: {ex.Message}");
    }

    var userProfileBody = await userProfileResponse.Content.ReadAsStringAsync();
    Console.WriteLine($"User Profile Response: {userProfileBody}");

    // Attempt deserialization
    SpotifyUserProfileResponse userProfile;
    try
    {
        userProfile = JsonSerializer.Deserialize<SpotifyUserProfileResponse>(userProfileBody);
        Console.WriteLine($"User Profile after Deserialization: {JsonSerializer.Serialize(userProfile)}");
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error deserializing user profile: {ex.Message}");
    }

    // Check if the profile has valid email
    if (userProfile == null || string.IsNullOrEmpty(userProfile.Email))
    {
        return BadRequest("Failed to retrieve valid user profile information.");
    }

    Console.WriteLine($"User Email: {userProfile.Email}");  // Ensure this logs the correct email

    // Check if the user exists in the database
    var user = await _userManager.FindByEmailAsync(userProfile.Email);
    if (user == null)
    {
        // Create a new user
        user = new AppUser
        {
            UserName = userProfile.Email, // Use email as username if no display name
            Email = userProfile.Email,
            SpotifyAccessToken = tokenData.AccessToken,
            SpotifyRefreshToken = tokenData.RefreshToken,
            DisplayName = userProfile.DisplayName ?? userProfile.Email,
            ProfileImageUrl = userProfile.Images?.FirstOrDefault()?.Url ?? string.Empty
        };

        var createResult = await _userManager.CreateAsync(user);
        if (!createResult.Succeeded)
        {
            return StatusCode(500, $"Failed to create user: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
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
            return StatusCode(500, $"Failed to update user tokens: {string.Join(", ", updateResult.Errors.Select(e => e.Description))}");
        }
    }

    return Ok(new
    {
        message = "User authenticated successfully.",
        user = new
        {
            user.Email,
            user.DisplayName,
            user.ProfileImageUrl,
            user.SpotifyAccessToken
        }
    });
}

    }
}
