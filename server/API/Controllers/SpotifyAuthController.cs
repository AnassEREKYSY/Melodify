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

        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state)
        {
            var tokenData = await _spotifyAuthService.ExchangeCodeForTokenAsync(code);
            var userProfile = await _spotifyAuthService.GetSpotifyUserProfileAsync(tokenData.AccessToken);

            var redirectUrl =
                $"https://melodify.anasserekysy.com/home" +
                $"?accessToken={tokenData.AccessToken}" +
                $"&displayName={Uri.EscapeDataString(userProfile.DisplayName)}";

            return Redirect(redirectUrl);
        }
    }
}
