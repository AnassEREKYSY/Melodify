using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;
using Core.Entities;

namespace API.Controllers
{
    [ApiController]
    [Route("api/favorites-songs")]
    public class FavoritesSongsController(IFavoritesSongService favoritesSongService) : ControllerBase
    {
        private readonly IFavoritesSongService _favoritesSongService = favoritesSongService;

        [HttpGet("all")]
        public async Task<IActionResult> GetAllFavorites()
        {
            var favorites = await _favoritesSongService.GetAllFavoritesAsync();
            return Ok(favorites);
        }

        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetFavoritesByUserId(string userId)
        {
            var favorites = await _favoritesSongService.GetFavoritesByUserIdAsync(userId);
            if (favorites == null || !favorites.Any())
            {
                return NotFound($"No favorite songs found for user with ID: {userId}");
            }
            return Ok(favorites);
        }

        [HttpGet("one/{id}")]
        public async Task<IActionResult> GetFavoriteById(int id)
        {
            var favorite = await _favoritesSongService.GetFavoriteByIdAsync(id);
            if (favorite == null)
            {
                return NotFound($"Favorite with ID {id} not found");
            }
            return Ok(favorite);
        }

        [HttpPost("create")]
        public async Task<IActionResult> AddToFavorites([FromBody] FavoritesSong favorite)
        {
            if (favorite == null)
            {
                return BadRequest("Invalid favorite song data");
            }

            try
            {
                var createdFavorite = await _favoritesSongService.AddToFavoritesAsync(favorite);
                return CreatedAtAction(nameof(GetFavoriteById), new { id = createdFavorite.Id }, createdFavorite);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> RemoveFromFavorites(int id)
        {
            var isRemoved = await _favoritesSongService.RemoveFromFavoritesAsync(id);
            if (!isRemoved)
            {
                return NotFound($"Favorite with ID {id} not found");
            }
            return NoContent();
        }

        [HttpDelete("remove-by-song/{userId}/{songId}")]
        public async Task<IActionResult> RemoveFromFavoritesBySongId(string userId, int songId)
        {
            var isRemoved = await _favoritesSongService.RemoveFromFavoritesBySongIdAsync(userId, songId);
            if (!isRemoved)
            {
                return NotFound($"Favorite song for user {userId} with song ID {songId} not found");
            }
            return NoContent();
        }
    }
}
