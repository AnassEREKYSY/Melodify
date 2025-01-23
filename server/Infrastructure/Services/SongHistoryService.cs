using Core.Entities;
using Infrastructure.IServices;

namespace Infrastructure.Services
{

    public class SongHistoryService : ISongHistoryService
    {
        private readonly List<SongHistory> _songHistories;

        public SongHistoryService()
        {
            _songHistories = [];
        }

        public async Task<IEnumerable<SongHistory>> GetAllHistoryAsync()
        {
            return await Task.FromResult(_songHistories);
        }

        public async Task<IEnumerable<SongHistory>> GetHistoryByUserIdAsync(string userId)
        {
            var userHistory = _songHistories.Where(h => h.UserId == userId).ToList();
            return await Task.FromResult(userHistory);
        }

        public async Task<SongHistory?> GetHistoryByIdAsync(int id)
        {
            var history = _songHistories.FirstOrDefault(h => h.Id == id);
            return await Task.FromResult(history);
        }

        public async Task<SongHistory> RecordHistoryAsync(SongHistory history)
        {
            history.Id = _songHistories.Any() ? _songHistories.Max(h => h.Id) + 1 : 1;
            history.PlayedAt = DateTime.UtcNow;
            _songHistories.Add(history);
            return await Task.FromResult(history);
        }

        public async Task<bool> DeleteHistoryAsync(int id)
        {
            var history = _songHistories.FirstOrDefault(h => h.Id == id);
            if (history == null) return await Task.FromResult(false);

            _songHistories.Remove(history);
            return await Task.FromResult(true);
        }
    }
}
