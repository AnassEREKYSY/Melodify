namespace Core.Entities
{
    public class Playlist
    {
        public string Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Spotify-related fields
        public string ExternalUrl { get; set; } = string.Empty; // Spotify external URL
        public List<string> ImageUrls { get; set; } = new List<string>(); // List of image URLs
        public string OwnerDisplayName { get; set; } = string.Empty; // Owner's display name
        public string OwnerUri { get; set; } = string.Empty; // Owner's URI
        public bool Public { get; set; } // Whether the playlist is public
        public string SnapshotId { get; set; } = string.Empty; // Snapshot ID of the playlist

        // Relationship fields
        public string UserId { get; set; }
        public AppUser User { get; set; }
        public ICollection<Song> Songs { get; set; } = new List<Song>();
    }
}
