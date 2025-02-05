using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;
using Core.Entities;
using Core.Dtos;
using System.Threading.Tasks;

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

        [HttpGet("spotify-by-user/{spotifyid}")]
        public async Task<IActionResult> GetPlaylistsSpotifyByUserId(string spotifyid, [FromQuery] int offset = 0, [FromQuery] int limit = 20)
        {
            var playlists = await _playlistService.GetSpotifyPlaylistsByUserIdAsync(spotifyid, offset, limit);
            return Ok(playlists);
        }

        [HttpGet("local-by-user/{userId}")]
        public async Task<IActionResult> GetPlaylistsByUserId(string userId)
        {
            var playlists = await _playlistService.GetPlaylistsByUserIdAsync(userId);
            return Ok(playlists);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePlaylist([FromBody] PlaylistCreateDto playlistCreateDto)
        {
            try
            {
                var playlist = await _playlistService.CreatePlaylistAsync(playlistCreateDto);

                return CreatedAtAction(nameof(GetPlaylistsSpotifyByUserId), new { spotifyid = playlistCreateDto.UserId }, playlist);
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to create playlist: {ex.Message}");
            }
        }

        [HttpDelete("delete/{userId}/{playlistId}")]
        public async Task<IActionResult> DeletePlaylist(string userId, string playlistId)
        {
            var result = await _playlistService.DeletePlaylistAsync(userId, playlistId);

            if (result)
            {
                return Ok("Playlist successfully deleted (unfollowed).");
            }
            else
            {
                return BadRequest("Failed to delete playlist.");
            }
        }

        [HttpPost("add-song/{playlistId}")]
        public async Task<IActionResult> AddSongToPlaylist(string playlistId, [FromBody] SongDto songDto)
        {
            if (string.IsNullOrEmpty(songDto.UserId) || string.IsNullOrEmpty(songDto.SongId))
            {
                return BadRequest("UserId and SongId must be provided.");
            }

            try
            {
                var success = await _playlistService.AddSongToPlaylistAsync(songDto.UserId, playlistId, songDto.SongId);

                if (success)
                    return Ok("Song successfully added to playlist.");

                return BadRequest("Failed to add song to playlist.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpDelete("remove-song-from-playlist/{userId}/{playlistId}/{songId}")]
        public async Task<IActionResult> RemoveSongFromPlaylist(string userId, string playlistId, string songId)
        {

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User must be authenticated to remove a song from a playlist.");
            }

            try
            {
                var result = await _playlistService.RemoveSongFromPlaylistAsync(userId, playlistId, songId);

                if (result)
                {
                    return Ok("Song removed from playlist successfully.");
                }
                else
                {
                    return NotFound($"Failed to remove song with ID {songId} from playlist {playlistId}.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while removing the song: {ex.Message}");
            }
        }
    }
}
