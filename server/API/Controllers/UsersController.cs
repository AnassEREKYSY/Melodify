using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController(IUserService _userService, ISpotifyAuthService _spotifyAuthService) : ControllerBase
    {

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

        [HttpDelete("unfollow-artist/{artistId}")]
        public async Task<IActionResult> UnfollowArtist(string artistId)
        {
            var accessToken = GetAccessTokenFromHeader();

            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }

            var success = await _userService.UnfollowArtistAsync(accessToken, artistId);

            if (success)
            {
                return Ok(new { message = $"Successfully unfollowed artist {artistId}" });
            }

            return BadRequest(new { message = $"Failed to unfollow artist {artistId}" });
        }

        
        [HttpPost("follow-artist/{artistId}")]
        public async Task<IActionResult> FollowArtist(string artistId)
        {
            var accessToken = GetAccessTokenFromHeader();

            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }

            var success = await _userService.FollowArtistAsync(accessToken, artistId);

            if (!success)
            {
                return BadRequest("Failed to follow the artist.");
            }

            return Ok(new { message = "Artist followed successfully." });
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
