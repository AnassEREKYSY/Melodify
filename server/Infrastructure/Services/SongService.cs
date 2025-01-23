using Core.Entities;
using Infrastructure.IServices;
namespace Infrastructure.Services
{
    public class SongService : ISongService
    {
        private readonly List<Song> _songs;

        public SongService()
        {
            _songs = [];
        }

        public async Task<IEnumerable<Song>> GetAllSongsAsync()
        {
            return await Task.FromResult(_songs);
        }

        public async Task<Song?> GetSongByIdAsync(int id)
        {
            var song = _songs.FirstOrDefault(s => s.Id == id);
            return await Task.FromResult(song);
        }

        public async Task<Song> CreateSongAsync(Song song)
        {
            song.Id = _songs.Count != 0 ? _songs.Max(s => s.Id) + 1 : 1;
            _songs.Add(song);
            return await Task.FromResult(song);
        }

        public async Task<Song?> UpdateSongAsync(int id, Song updatedSong)
        {
            var existingSong = _songs.FirstOrDefault(s => s.Id == id);
            if (existingSong == null) return null;

            existingSong.Title = updatedSong.Title;
            existingSong.Artist = updatedSong.Artist;
            existingSong.Album = updatedSong.Album;
            existingSong.Duration = updatedSong.Duration;

            return await Task.FromResult(existingSong);
        }

        public async Task<bool> DeleteSongAsync(int id)
        {
            var song = _songs.FirstOrDefault(s => s.Id == id);
            if (song == null) return await Task.FromResult(false);

            _songs.Remove(song);
            return await Task.FromResult(true);
        }
    }

}
