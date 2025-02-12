using Core.Dtos;
using Core.Entities;
using Infrastructure.IServices;
using Infrastructure.Middleware;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/search")]
    [SpotifyAuthorize] 
    public class SongsController(ISearchService _songService) : ControllerBase
    {

        [HttpGet("spotify-search")]
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

            return Ok(searchResults);
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
