
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

        [HttpGet("get-url-login")]
        public IActionResult GetUrlLogin()
        {
            var authUrl = _spotifyAuthService.GetLoginUrl();
            return Ok(authUrl);
        }

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
