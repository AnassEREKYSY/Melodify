using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;
using Core.Dtos;
using Microsoft.AspNetCore.Authorization;
using Infrastructure.Middleware;

namespace API.Controllers
{
    [ApiController]
    [Route("api/playlists")]
    [SpotifyAuthorize] 
    public class PlaylistsController(IPlaylistService _playlistService) : ControllerBase
    {

        [HttpGet("spotify-by-user/{spotifyid}")]
        public async Task<IActionResult> GetPlaylistsSpotifyByUserId(string spotifyid, [FromQuery] int offset = 0, [FromQuery] int limit = 20)
        {
            var playlists = await _playlistService.GetSpotifyPlaylistsByUserIdAsync(spotifyid, offset, limit);
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

        [HttpPost("add-song-to-playlist")]
        public async Task<IActionResult> AddSongToPlaylist([FromBody] SongCreateDto songDto)
        {
            if (string.IsNullOrEmpty(songDto.UserId) || string.IsNullOrEmpty(songDto.SongId))
            {
                return BadRequest("UserId and SongId must be provided.");
            }

            try
            {
                var success = await _playlistService.AddSongToPlaylistAsync(songDto);

                if (success)
                    return Ok("Song successfully added to playlist.");

                return BadRequest("Failed to add song to playlist.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpDelete("remove-song-from-playlist")]
        public async Task<IActionResult> RemoveSongFromPlaylist(SongCreateDto songCreateDto)
        {

            if (string.IsNullOrEmpty(songCreateDto.UserId))
            {
                return Unauthorized("User must be authenticated to remove a song from a playlist.");
            }

            try
            {
                var result = await _playlistService.RemoveSongFromPlaylistAsync(songCreateDto);

                if (result)
                {
                    return Ok("Song removed from playlist successfully.");
                }
                else
                {
                    return NotFound($"Failed to remove song with ID {songCreateDto.SongId} from playlist {songCreateDto.PlaylistId}.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while removing the song: {ex.Message}");
            }
        }
    }
}
