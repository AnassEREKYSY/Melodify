
using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/spotify-auth")]
    public class SpotifyAuthController : ControllerBase
    {
        private readonly ISpotifyAuthService _spotifyAuthService;
        private readonly IUserService _userService;


        public SpotifyAuthController(ISpotifyAuthService spotifyAuthService, IUserService userService)
        {
            _spotifyAuthService = spotifyAuthService;
            _userService = userService;
        }

        [HttpGet("login")]
        public IActionResult Login()
        {
            var authUrl = _spotifyAuthService.GetLoginUrl();
            return Redirect(authUrl);
        }

        // [HttpGet("get-connected-user")]
        // public async Task<IActionResult> GetConnectedUserAsync()
        // {
        //     var token = Request.Headers["Authorization"].ToString();
        //     if (string.IsNullOrEmpty(token))
        //     {
        //         return Unauthorized("No token found in request.");
        //     }

        //     Console.WriteLine("Token received: " + token);
        //     var userId = User?.Identity?.Name ?? User?.FindFirst("sub")?.Value;

        //     if (string.IsNullOrEmpty(userId))
        //     {
        //         return Unauthorized("User is not authenticated.");
        //     }
        //     var user = await _spotifyAuthService.GetOneUser(userId);

        //     if (user == null)
        //     {
        //         return NotFound("User not found.");
        //     }

        //     return Ok(new
        //     {
        //         user.Id,
        //         user.SpotifyID,
        //         user.FirstName,
        //         user.LastName,
        //         user.SpotifyAccessToken,
        //         user.SpotifyRefreshToken,
        //         user.Email,
        //         user.DisplayName,
        //         user.ProfileImageUrl,
        //         user.Playlists,
        //         user.SongHistory,
        //         user.FavoriteSongs
        //     });
        // }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state)
        {
            try
            {
                // Log incoming query parameters
                Console.WriteLine($"Callback received with code: {code}, state: {state}");

                var tokenData = await _spotifyAuthService.ExchangeCodeForTokenAsync(code);
                var userProfile = await _userService.GetUserProfileAsync(tokenData.AccessToken);
                var user = await _spotifyAuthService.AuthenticateUserAsync(userProfile, tokenData);

                // Log the user data
                Console.WriteLine($"User authenticated: {user.Email}");

                return Ok(new
                {
                    message = "User authenticated successfully.",
                    user = new
                    {
                        user.SpotifyID,
                        user.Email,
                        user.DisplayName,
                        user.ProfileImageUrl,
                        user.SpotifyAccessToken,
                        user.UserAccessToken
                    }
                });
            }
            catch (Exception ex)
            {
                // Log the error and provide more details
                Console.WriteLine($"Exception in Callback: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

    }
}
