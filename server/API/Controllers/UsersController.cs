
using Infrastructure.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController(ISpotifyAuthService _spotifyAuthService) : ControllerBase
    {

        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _spotifyAuthService.GetAllUsers();
            return Ok(users);
        }
    }
}