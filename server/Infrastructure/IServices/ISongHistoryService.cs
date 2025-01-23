using Core.Entities;

namespace Infrastructure.IServices
{
    public interface ISongHistoryService
    {
        Task<IEnumerable<SongHistory>> GetAllHistoryAsync();
        Task<IEnumerable<SongHistory>> GetHistoryByUserIdAsync(string userId);
        Task<SongHistory?> GetHistoryByIdAsync(int id);
        Task<SongHistory> RecordHistoryAsync(SongHistory history);
        Task<bool> DeleteHistoryAsync(int id);
    }
}
