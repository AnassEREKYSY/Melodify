namespace Core.Entities
{
    public class Playlist
    {
        public string Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public string ExternalUrl { get; set; } = string.Empty;
        public List<string> ImageUrls { get; set; } = new List<string>(); 
        public string OwnerDisplayName { get; set; } = string.Empty; 
        public string OwnerUri { get; set; } = string.Empty;
        public bool Public { get; set; } 
        public string SnapshotId { get; set; } = string.Empty; 

        public string UserId { get; set; }
        public AppUser User { get; set; }
        public ICollection<Song> Songs { get; set; } = new List<Song>();
    }
}
