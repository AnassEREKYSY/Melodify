using Core.Entities;
using Infrastructure.Response;

namespace Infrastructure.IServices
{
    public interface ISpotifyAuthService
    {
       string GetLoginUrl();
        Task<SpotifyTokenResponse> ExchangeCodeForTokenAsync(string code);
        Task<SpotifyUserProfileResponse> GetUserProfileAsync(string accessToken);
        Task<AppUser> AuthenticateUserAsync(SpotifyUserProfileResponse userProfile, SpotifyTokenResponse tokenData);
    }
}