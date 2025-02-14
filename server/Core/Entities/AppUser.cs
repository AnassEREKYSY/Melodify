

namespace Core.Entities
{
    public class AppUser
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string SpotifyAccessToken { get; set; } = string.Empty;
        public string SpotifyRefreshToken { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
        public string SpotifyID { get; set; } = string.Empty;
        public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
    }
}
