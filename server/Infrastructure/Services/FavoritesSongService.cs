using Core.Entities;
using Infrastructure.IServices;


namespace Infrastructure.Services
{

    public class FavoritesSongService : IFavoritesSongService
    {
        private readonly List<FavoritesSong> _favoritesSongs;

        public FavoritesSongService()
        {
            // Mocked data store
            _favoritesSongs = new List<FavoritesSong>();
        }

        public async Task<IEnumerable<FavoritesSong>> GetAllFavoritesAsync()
        {
            return await Task.FromResult(_favoritesSongs);
        }

        public async Task<IEnumerable<FavoritesSong>> GetFavoritesByUserIdAsync(string userId)
        {
            var userFavorites = _favoritesSongs.Where(f => f.UserId == userId).ToList();
            return await Task.FromResult(userFavorites);
        }

        public async Task<FavoritesSong?> GetFavoriteByIdAsync(int id)
        {
            var favorite = _favoritesSongs.FirstOrDefault(f => f.Id == id);
            return await Task.FromResult(favorite);
        }

        public async Task<FavoritesSong> AddToFavoritesAsync(FavoritesSong favorite)
        {
            if (_favoritesSongs.Any(f => f.UserId == favorite.UserId && f.SongId == favorite.SongId))
            {
                throw new InvalidOperationException("This song is already in the user's favorites.");
            }

            favorite.Id = _favoritesSongs.Any() ? _favoritesSongs.Max(f => f.Id) + 1 : 1;
            _favoritesSongs.Add(favorite);
            return await Task.FromResult(favorite);
        }

        public async Task<bool> RemoveFromFavoritesAsync(int id)
        {
            var favorite = _favoritesSongs.FirstOrDefault(f => f.Id == id);
            if (favorite == null) return await Task.FromResult(false);

            _favoritesSongs.Remove(favorite);
            return await Task.FromResult(true);
        }

        public async Task<bool> RemoveFromFavoritesBySongIdAsync(string userId, int songId)
        {
            var favorite = _favoritesSongs.FirstOrDefault(f => f.UserId == userId && f.SongId == songId);
            if (favorite == null) return await Task.FromResult(false);

            _favoritesSongs.Remove(favorite);
            return await Task.FromResult(true);
        }
    }
}
