namespace Core.Dtos
{
    public class PlaylistDto
    {
        public string Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string UserId { get; set; }
        public bool isPublic { get; set; }
        public string ExternalUrl { get; set; } = string.Empty; 
        public List<string> ImageUrls { get; set; } = new List<string>();
        public string OwnerDisplayName { get; set; } = string.Empty;
        public string OwnerUri { get; set; } = string.Empty; 
        public string SnapshotId { get; set; } = string.Empty;
        public ICollection<SongDto> Songs { get; set; } = new List<SongDto>();
    }
}