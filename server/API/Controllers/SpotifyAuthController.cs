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
            return Ok(new { url = authUrl });
        }

        [HttpGet("callback")]
        public IActionResult Callback([FromQuery] string code, [FromQuery] string state)
        {
            return Redirect($"https://melodify.anasserekysy.com/login?code={code}&state={state}");
        }

        [HttpGet("exchange")]
        public async Task<IActionResult> Exchange([FromQuery] string code)
        {
            var tokenData = await _spotifyAuthService.ExchangeCodeForTokenAsync(code);
            var userProfile = await _spotifyAuthService.GetSpotifyUserProfileAsync(tokenData.AccessToken);

            return Ok(new
            {
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
    }
}
