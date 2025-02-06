
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
            var authHeader = Request.Headers.Authorization.ToString();

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }

            var accessToken = authHeader["Bearer ".Length..].Trim();

            var userProfile = await _spotifyAuthService.GetSpotifyUserProfileAsync(accessToken);

            if (userProfile == null)
            {
                return BadRequest("Failed to retrieve Spotify user profile.");
            }

            return Ok(userProfile);
        }

    }
}