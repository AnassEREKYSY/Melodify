
using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/spotify-auth")]
    public class SpotifyAuthController : ControllerBase
    {
        private readonly ISpotifyAuthService _spotifyAuthService;


        public SpotifyAuthController(ISpotifyAuthService spotifyAuthService)
        {
            _spotifyAuthService = spotifyAuthService;
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
                Console.WriteLine($"Callback received with code: {code}, state: {state}");

                var tokenData = await _spotifyAuthService.ExchangeCodeForTokenAsync(code);
                var userProfile = await _spotifyAuthService.GetSpotifyUserProfileAsync(tokenData.AccessToken);

                return Ok(new
                {
                    message = "User authenticated successfully.",
                    userProfile = new
                    {
                        userProfile.Id,
                        userProfile.Email,
                        userProfile.DisplayName,
                        tokenData.AccessToken,
                        tokenData.ExpiresIn,
                        tokenData.RefreshToken
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in Callback: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

    }
}
