using Core.Entities;
using Infrastructure.Response;

namespace Infrastructure.IServices
{
    public interface IUserService
    {
        Task<SpotifyUserProfileResponse> GetUserProfileAsync(string accessToken);
        Task<List<AppUser>> GetAllUsers();
        Task<AppUser> GetOneUser(string userId);
        Task<string> GetUserToken(string userId);
        Task<string> GetUserTokenForSpotify(string userId);
        string GenerateJwtToken(AppUser user);
        Task<List<SpotifyFollowedArtistDetails>> GetFollowedArtistsAsync(string accessToken);
        Task<bool> UnfollowArtistAsync(string accessToken, string artistId);
        Task<bool> FollowArtistAsync(string accessToken, string artistId);
    }
}