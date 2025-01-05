using Core.Entities;
using Core.IData;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class StoreContext(DbContextOptions<StoreContext> options) : IdentityDbContext<AppUser>(options), IStoreContext
    {
        public DbSet<FavoritesSong> FavoritesSongs { get; set; }
        public DbSet<Song> Songs { get; set; }
        public DbSet<Playlist> Playlists { get; set; }
        public DbSet<SongHistory> SongHistories { get; set; }
        public async Task<int> SaveChangesAsync()
        {
            return await base.SaveChangesAsync();
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Many-to-many relationship between Playlist and Song
            modelBuilder.Entity<Playlist>()
                .HasMany(p => p.Songs)
                .WithMany(s => s.Playlists)
                .UsingEntity<Dictionary<string, object>>(
                    "PlaylistSong",
                    r => r.HasOne<Song>().WithMany().HasForeignKey("SongId"),
                    l => l.HasOne<Playlist>().WithMany().HasForeignKey("PlaylistId"));

            // Many-to-many relationship between User and Song through FavoritesSong
            modelBuilder.Entity<FavoritesSong>()
                .HasKey(fs => new { fs.UserId, fs.SongId });
            modelBuilder.Entity<FavoritesSong>()
                .HasOne(fs => fs.User)
                .WithMany(u => u.FavoriteSongs)
                .HasForeignKey(fs => fs.UserId);
            modelBuilder.Entity<FavoritesSong>()
                .HasOne(fs => fs.Song)
                .WithMany(s => s.FavoritesSongs)
                .HasForeignKey(fs => fs.SongId);

            // One-to-many relationship between User and SongHistory
            modelBuilder.Entity<SongHistory>()
                .HasOne(sh => sh.User)
                .WithMany(u => u.SongHistory)
                .HasForeignKey(sh => sh.UserId);
            modelBuilder.Entity<SongHistory>()
                .HasOne(sh => sh.Song)
                .WithMany(s => s.SongHistories)
                .HasForeignKey(sh => sh.SongId);
        }
    }
}