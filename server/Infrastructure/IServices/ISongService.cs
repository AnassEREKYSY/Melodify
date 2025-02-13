using Infrastructure.Response;
namespace Infrastructure.IServices
{
    public interface ISongService
    {
        Task<SpotifyTrackReponse?> GetSongByIdAsync(string accessToken, string songId);
    }
}
