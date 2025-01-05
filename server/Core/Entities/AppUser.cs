using System;
using Microsoft.AspNetCore.Identity;

namespace Core.Entities
{
    public class AppUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;

        // Navigation Property: A user can have many playlists
        public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();

        // Navigation Property: A user can have one favorites songs list
        public ICollection<FavoritesSong> FavoriteSongs { get; set; } = new List<FavoritesSong>();

        // Navigation Property: A user can have one song history
        public ICollection<SongHistory> SongHistory { get; set; } = new List<SongHistory>();
    }
}
