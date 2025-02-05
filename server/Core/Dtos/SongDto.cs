namespace Core.Dtos
{
    public class SongDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public List<ArtistDto> Artists { get; set; }
        public AlbumDto Album { get; set; }
        public int DurationMs { get; set; }
    }
}