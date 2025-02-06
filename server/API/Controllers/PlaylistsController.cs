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

        [HttpGet("spotify-by-user")]
        public async Task<IActionResult> GetPlaylistsSpotifyByUserId([FromQuery] int offset = 0, [FromQuery] int limit = 20)
        {
            var accessToken =ExtractAccessToken();
            if (accessToken == null)
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }
            var playlists = await _playlistService.GetSpotifyPlaylistsByUserIdAsync(accessToken, offset, limit);
            return Ok(playlists);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePlaylist([FromBody] PlaylistCreateDto playlistCreateDto)
        {
            try
            {
                var accessToken =ExtractAccessToken();
                if (accessToken == null)
                {
                    return Unauthorized("Missing or invalid Authorization header.");
                }
                var playlist = await _playlistService.CreatePlaylistAsync(playlistCreateDto,accessToken);

                return CreatedAtAction(nameof(GetPlaylistsSpotifyByUserId), new { spotifyid = playlistCreateDto.UserId }, playlist);
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to create playlist: {ex.Message}");
            }
        }

        [HttpDelete("delete/{playlistId}")]
        public async Task<IActionResult> DeletePlaylist(string playlistId)
        {
            var accessToken =ExtractAccessToken();
            if (accessToken == null)
            {
                return Unauthorized("Missing or invalid Authorization header.");
            }
            var result = await _playlistService.DeletePlaylistAsync(accessToken, playlistId);

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
                var accessToken =ExtractAccessToken();
                if (accessToken == null)
                {
                    return Unauthorized("Missing or invalid Authorization header.");
                }
                var success = await _playlistService.AddSongToPlaylistAsync(songDto, accessToken);

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
                var accessToken =ExtractAccessToken();
                if (accessToken == null)
                {
                    return Unauthorized("Missing or invalid Authorization header.");
                }
                var result = await _playlistService.RemoveSongFromPlaylistAsync(songCreateDto, accessToken);

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
