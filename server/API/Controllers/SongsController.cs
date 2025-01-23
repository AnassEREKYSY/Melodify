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

        // GET: api/songs
        [HttpGet]
        public async Task<IActionResult> GetAllSongs()
        {
            var songs = await _songService.GetAllSongsAsync();
            return Ok(songs);
        }

        // GET: api/songs/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSongById(int id)
        {
            var song = await _songService.GetSongByIdAsync(id);
            if (song == null)
                return NotFound($"Song with ID {id} was not found.");
            return Ok(song);
        }

        // POST: api/songs
        [HttpPost]
        public async Task<IActionResult> CreateSong([FromBody] Song newSong)
        {
            if (newSong == null)
                return BadRequest("Song data is required.");

            var createdSong = await _songService.CreateSongAsync(newSong);
            return CreatedAtAction(nameof(GetSongById), new { id = createdSong.Id }, createdSong);
        }

        // PUT: api/songs/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSong(int id, [FromBody] Song updatedSong)
        {
            if (updatedSong == null)
                return BadRequest("Updated song data is required.");

            var result = await _songService.UpdateSongAsync(id, updatedSong);
            if (result == null)
                return NotFound($"Song with ID {id} was not found.");

            return Ok(result);
        }

        // DELETE: api/songs/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSong(int id)
        {
            var success = await _songService.DeleteSongAsync(id);
            if (!success)
                return NotFound($"Song with ID {id} was not found.");

            return NoContent();
        }
    }
}
