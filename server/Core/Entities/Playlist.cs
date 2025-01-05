using System;
using System.Collections.Generic;

namespace Core.Entities
{
    public class Playlist
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public string UserId { get; set; }
        public AppUser User { get; set; }

        public ICollection<Song> Songs { get; set; } = new List<Song>();
    }
}
