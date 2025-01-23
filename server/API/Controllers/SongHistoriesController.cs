using Core.Entities;
using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/song-histories")]
    public class SongsHistoriesController : ControllerBase
    {
        private readonly ISongHistoryService _songHistoryService;

        public SongsHistoriesController(ISongHistoryService songHistoryService)
        {
            _songHistoryService = songHistoryService;
        }

        // GET: api/song-histories
        [HttpGet]
        public async Task<IActionResult> GetAllHistory()
        {
            var histories = await _songHistoryService.GetAllHistoryAsync();
            return Ok(histories);
        }

        // GET: api/song-histories/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetHistoryByUserId(string userId)
        {
            var userHistories = await _songHistoryService.GetHistoryByUserIdAsync(userId);
            if (!userHistories.Any())
                return NotFound($"No song history found for user with ID {userId}.");

            return Ok(userHistories);
        }

        // GET: api/song-histories/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetHistoryById(int id)
        {
            var history = await _songHistoryService.GetHistoryByIdAsync(id);
            if (history == null)
                return NotFound($"Song history with ID {id} was not found.");

            return Ok(history);
        }

        // POST: api/song-histories
        [HttpPost]
        public async Task<IActionResult> RecordHistory([FromBody] SongHistory newHistory)
        {
            if (newHistory == null)
                return BadRequest("History data is required.");

            var recordedHistory = await _songHistoryService.RecordHistoryAsync(newHistory);
            return CreatedAtAction(nameof(GetHistoryById), new { id = recordedHistory.Id }, recordedHistory);
        }

        // DELETE: api/song-histories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHistory(int id)
        {
            var success = await _songHistoryService.DeleteHistoryAsync(id);
            if (!success)
                return NotFound($"Song history with ID {id} was not found.");

            return NoContent();
        }
    }
}
