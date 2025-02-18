using Core.Dtos;
using Core.Entities;
using Infrastructure.IServices;
using Infrastructure.Middleware;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/songs")]
    [SpotifyAuthorize] 
    public class SongsController(ISongService _songService) : ControllerBase
    {

        [HttpGet("one/{songId}")]
        public async Task<IActionResult> SearchSongs(string songId)
        {
            var accessToken =ExtractAccessToken();
            if (accessToken == null)
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }
            
            var songResult = await _songService.GetSongByIdAsync(accessToken, songId);

            return Ok(songResult);
        }
    
        
        private string? ExtractAccessToken()
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
