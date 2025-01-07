using System;
using Microsoft.AspNetCore.Identity;

namespace Core.Entities
{
    public class AppUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string SpotifyAccessToken { get; set; } = string.Empty;
        public string SpotifyRefreshToken { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
        public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
        public ICollection<FavoritesSong> FavoriteSongs { get; set; } = new List<FavoritesSong>();
        public ICollection<SongHistory> SongHistory { get; set; } = new List<SongHistory>();
    }
}
