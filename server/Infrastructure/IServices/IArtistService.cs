using Core.Entities;
using Infrastructure.Response;
namespace Infrastructure.IServices
{
    public interface IArtistService
    {
        Task<SpotifyArtistDetails?> GetArtistByIdAsync(string accessToken, string artistId);
        Task<List<SpotifyTrackReponse>?> GetArtistTopSongsAsync(string accessToken, string artistId, string market = "US");
    }
}
