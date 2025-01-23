using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;
using Core.Entities;

namespace API.Controllers
{
    [ApiController]
    [Route("api/spotify-auth")]
    public class PlaylistsController : ControllerBase
    {
        private readonly IPlaylistService _playlistService;

        public PlaylistsController(IPlaylistService playlistService)
        {
            _playlistService = playlistService;
        }

        // GET: api/spotify-auth/playlists
        [HttpGet("playlists")]
        public async Task<IActionResult> GetAllPlaylists()
        {
            var playlists = await _playlistService.GetAllPlaylistsAsync();
            return Ok(playlists);
        }

        // GET: api/spotify-auth/playlists/{userId}
        [HttpGet("playlists/{userId}")]
        public async Task<IActionResult> GetPlaylistsByUserId(string userId)
        {
            var playlists = await _playlistService.GetPlaylistsByUserIdAsync(userId);
            if (playlists == null || !playlists.Any())
            {
                return NotFound($"No playlists found for user with ID: {userId}");
            }
            return Ok(playlists);
        }

        // GET: api/spotify-auth/playlists/{id}
        [HttpGet("playlists/{id}")]
        public async Task<IActionResult> GetPlaylistById(int id)
        {
            var playlist = await _playlistService.GetPlaylistByIdAsync(id);
            if (playlist == null)
            {
                return NotFound($"Playlist with ID {id} not found");
            }
            return Ok(playlist);
        }

        // POST: api/spotify-auth/playlists
        [HttpPost("playlists")]
        public async Task<IActionResult> CreatePlaylist([FromBody] Playlist playlist)
        {
            if (playlist == null)
            {
                return BadRequest("Invalid playlist data");
            }

            var createdPlaylist = await _playlistService.CreatePlaylistAsync(playlist);
            return CreatedAtAction(nameof(GetPlaylistById), new { id = createdPlaylist.Id }, createdPlaylist);
        }

        // PUT: api/spotify-auth/playlists/{id}
        [HttpPut("playlists/{id}")]
        public async Task<IActionResult> UpdatePlaylist(int id, [FromBody] Playlist updatedPlaylist)
        {
            if (updatedPlaylist == null)
            {
                return BadRequest("Invalid playlist data");
            }

            var existingPlaylist = await _playlistService.UpdatePlaylistAsync(id, updatedPlaylist);
            if (existingPlaylist == null)
            {
                return NotFound($"Playlist with ID {id} not found");
            }

            return Ok(existingPlaylist);
        }

        // DELETE: api/spotify-auth/playlists/{id}
        [HttpDelete("playlists/{id}")]
        public async Task<IActionResult> DeletePlaylist(int id)
        {
            var isDeleted = await _playlistService.DeletePlaylistAsync(id);
            if (!isDeleted)
            {
                return NotFound($"Playlist with ID {id} not found");
            }
            return NoContent();
        }

        // POST: api/spotify-auth/playlists/{playlistId}/add-song
        [HttpPost("playlists/{playlistId}/add-song")]
        public async Task<IActionResult> AddSongToPlaylist(int playlistId, [FromBody] Song song)
        {
            if (song == null)
            {
                return BadRequest("Invalid song data");
            }

            var isAdded = await _playlistService.AddSongToPlaylistAsync(playlistId, song);
            if (!isAdded)
            {
                return NotFound($"Playlist with ID {playlistId} not found");
            }
            return Ok();
        }

        // DELETE: api/spotify-auth/playlists/{playlistId}/remove-song/{songId}
        [HttpDelete("playlists/{playlistId}/remove-song/{songId}")]
        public async Task<IActionResult> RemoveSongFromPlaylist(int playlistId, int songId)
        {
            var isRemoved = await _playlistService.RemoveSongFromPlaylistAsync(playlistId, songId);
            if (!isRemoved)
            {
                return NotFound($"Playlist with ID {playlistId} or song with ID {songId} not found");
            }
            return NoContent();
        }
    }
}
