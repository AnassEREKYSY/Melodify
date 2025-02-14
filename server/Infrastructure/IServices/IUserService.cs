using Core.Entities;
using Infrastructure.Response;

namespace Infrastructure.IServices
{
    public interface IUserService
    {
        Task<SpotifyUserProfileResponse> GetUserProfileAsync(string accessToken);
        Task<List<SpotifyFollowedArtistDetails>> GetFollowedArtistsAsync(string accessToken);
        Task<bool> UnfollowArtistAsync(string accessToken, string artistId);
        Task<bool> FollowArtistAsync(string accessToken, string artistId);
    }
}