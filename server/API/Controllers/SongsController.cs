using Core.Dtos;
using Core.Entities;
using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/songs")]
    public class SongsController : ControllerBase
    {
        private readonly ISongService _songService;

        public SongsController(ISongService songService)
        {
            _songService = songService;
        }

        [HttpGet("favorites/{userId}")]
        public async Task<IActionResult> GetFavoriteSongs(string userId)
        {
            var songs = await _songService.GetFavoriteSongsAsync(userId);
            return Ok(songs);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchSongs([FromQuery] string query)
        {
            var songs = await _songService.SearchSongsAsync(query);
            return Ok(songs);
        }

        [HttpPost("add-to-favorites")]
        public async Task<IActionResult> AddToFavorites([FromBody] SongDto songDto)
        {
            var success = await _songService.AddSongToFavoritesAsync(songDto.UserId, songDto.SongId);
            if (success) return Ok();
            return NotFound("Song not found.");
        }

        [HttpDelete("remove-from-favorites")]
        public async Task<IActionResult> RemoveFromFavorites([FromBody] SongDto songDto)
        {
            var success = await _songService.RemoveSongFromFavoritesAsync(songDto.UserId, songDto.SongId);
            if (success) return NoContent();
            return NotFound("Song not found.");
        }
    }

}
