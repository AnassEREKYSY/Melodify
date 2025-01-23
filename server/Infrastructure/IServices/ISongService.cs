using Core.Entities;
namespace Infrastructure.IServices
{
    public interface ISongService
    {
        Task<IEnumerable<Song>> GetAllSongsAsync();
        Task<Song?> GetSongByIdAsync(int id);
        Task<Song> CreateSongAsync(Song song);
        Task<Song?> UpdateSongAsync(int id, Song updatedSong);
        Task<bool> DeleteSongAsync(int id);
    }

}
