namespace Core.Entities
{
    public class FavoritesSong
    {
        public int Id { get; set; }

        public string UserId { get; set; }
        public AppUser User { get; set; }

        public int SongId { get; set; }
        public Song Song { get; set; }
    }
}
