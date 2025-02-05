using Core.Dtos;
using Core.Entities;
using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/songs")]
    public class SongsController(ISongService _songService) : ControllerBase
    {

        [HttpGet("search")]
        public async Task<IActionResult> SearchSongs(
            [FromQuery] string userId, 
            [FromQuery] string query, 
            [FromQuery] int offset = 0, 
            [FromQuery] int limit = 10)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(query))
            {
                return BadRequest("User ID and search query are required.");
            }
            
            var searchResults = await _songService.SearchSongsAsync(userId, query, offset, limit);

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
    }

}
