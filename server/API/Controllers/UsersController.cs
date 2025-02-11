using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController(IUserService _userService, ISpotifyAuthService _spotifyAuthService) : ControllerBase
    {

        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsers();
            return Ok(users);
        }

        [HttpGet("spotify/me")]
        public async Task<IActionResult> GetSpotifyUserProfile()
        {
            var accessToken = GetAccessTokenFromHeader();

            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }

            var userProfile = await _spotifyAuthService.GetSpotifyUserProfileAsync(accessToken);

            if (userProfile == null)
            {
                return BadRequest("Failed to retrieve Spotify user profile.");
            }

            return Ok(userProfile);
        }

        [HttpGet("followed-artists")]
        public async Task<IActionResult> GetFollowedArtists()
        {
            var accessToken = GetAccessTokenFromHeader();

            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }

            var artists = await _userService.GetFollowedArtistsAsync(accessToken);

            if (artists == null || artists.Count == 0)
            {
                return NotFound("No followed artists found.");
            }

            return Ok(artists);
        }

        private string GetAccessTokenFromHeader()
        {
            var authHeader = Request.Headers.Authorization.ToString();

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return null;
            }

            return authHeader["Bearer ".Length..].Trim();
        }
    }
}
