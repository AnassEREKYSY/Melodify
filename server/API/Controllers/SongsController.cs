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

        [HttpGet("search-song")]
        public async Task<IActionResult> SearchSongs(
            [FromQuery] string query, 
            [FromQuery] int offset = 0, 
            [FromQuery] int limit = 10)
        {
            var accessToken =ExtractAccessToken();
            if (accessToken == null)
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }
            if ( string.IsNullOrEmpty(query))
            {
                return BadRequest("Search query are required.");
            }
            
            var searchResults = await _songService.SearchSongsAsync(accessToken, query, offset, limit);

            return Ok(new
            {
                total = searchResults.Total,
                offset = searchResults.Offset,
                limit = searchResults.Limit,
                next = searchResults.Next,
                previous = searchResults.Previous,
                songs = searchResults.Items
            });
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
