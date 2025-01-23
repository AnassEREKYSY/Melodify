using Core.Entities;

namespace Infrastructure.IServices
{
    public interface IFavoritesSongService
    {
        Task<IEnumerable<FavoritesSong>> GetAllFavoritesAsync();
        Task<IEnumerable<FavoritesSong>> GetFavoritesByUserIdAsync(string userId);
        Task<FavoritesSong?> GetFavoriteByIdAsync(int id);
        Task<FavoritesSong> AddToFavoritesAsync(FavoritesSong favorite);
        Task<bool> RemoveFromFavoritesAsync(int id);
        Task<bool> RemoveFromFavoritesBySongIdAsync(string userId, int songId);
    }
}