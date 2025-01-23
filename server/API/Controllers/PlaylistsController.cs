using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;
using Core.Entities;
using Core.Dtos;

namespace API.Controllers
{
    [ApiController]
    [Route("api/playlists")]
    public class PlaylistsController : ControllerBase
    {
        private readonly IPlaylistService _playlistService;

        public PlaylistsController(IPlaylistService playlistService)
        {
            _playlistService = playlistService;
        }

        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetPlaylistsByUserId(string userId)
        {
            var playlists = await _playlistService.GetPlaylistsByUserIdAsync(userId);
            return Ok(playlists);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePlaylist([FromBody] PlaylistCreateDto playlistCreateDto)
        {
            var playlist = await _playlistService.CreatePlaylistAsync(playlistCreateDto.UserId, playlistCreateDto.Name, playlistCreateDto.Description);
            return CreatedAtAction(nameof(GetPlaylistsByUserId), new { userId = playlistCreateDto.UserId }, playlist);
        }

        [HttpPost("add-song/{playlistId}")]
        public async Task<IActionResult> AddSongToPlaylist(string playlistId, [FromBody] SongDto songDto)
        {
            var success = await _playlistService.AddSongToPlaylistAsync(songDto.UserId, playlistId, songDto.SongId);
            if (success) return Ok();
            return NotFound($"Playlist with ID {playlistId} or song with ID {songDto.SongId} not found.");
        }

        [HttpDelete("remove-song/{playlistId}/{songId}")]
        public async Task<IActionResult> RemoveSongFromPlaylist(string playlistId, int songId)
        {
            var userId = User.Identity.Name; 
            var result = await _playlistService.RemoveSongFromPlaylistAsync(userId, playlistId, songId);

            if (result)
            {
                return Ok("Song removed from playlist");
            }
            else
            {
                return BadRequest("Failed to remove song from playlist");
            }
        }

    }
}
