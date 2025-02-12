using Infrastructure.IServices;
using Infrastructure.Response;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/artists")]
    public class ArtistsController(IArtistService _artistService) : ControllerBase
    {

        [HttpGet("one/{artistId}")]
        public async Task<IActionResult> GetArtistById(string artistId)
        {
            var accessToken = GetAccessTokenFromHeader();

            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }

            var artist = await _artistService.GetArtistByIdAsync(accessToken, artistId);

            if (artist == null)
            {
                return NotFound($"Artist with ID {artistId} not found.");
            }

            return Ok(artist);
        }


        [HttpGet("songs/{artistId}")]
        public async Task<IActionResult> GetArtistTopSongs(string artistId)
        {
            var accessToken = GetAccessTokenFromHeader();

            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }

            var songs = await _artistService.GetArtistTopSongsAsync(accessToken, artistId);

            if (songs == null || songs.Count == 0)
            {
                return NotFound($"No top songs found for artist {artistId}.");
            }

            return Ok(songs);
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
