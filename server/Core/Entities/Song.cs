using System;
using System.Collections.Generic;

namespace Core.Entities
{
    public class Song
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string Album { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;

        public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
        
    }
}
