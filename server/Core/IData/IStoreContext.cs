using System;
using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Core.IData;

    public interface IStoreContext
    {
        DbSet<FavoritesSong> FavoritesSongs { get; set; }
        DbSet<Song> Songs { get; set; }
        DbSet<Playlist> Playlists { get; set; }
        DbSet<SongHistory> SongHistories { get; set; }
        Task<int> SaveChangesAsync();
    }