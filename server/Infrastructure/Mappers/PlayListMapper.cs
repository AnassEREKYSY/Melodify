using Infrastructure.Response;
using Core.Entities;

namespace Infrastructure.Mappers
{
    public class PlaylistMapper
    {
        public List<SpotifyPlaylistItem> MapToSpotifyPlaylistItems(List<Playlist> playlists)
        {
            return [.. playlists.Select(p => new SpotifyPlaylistItem
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                ExternalUrls = new ExternalUrls
                {
                    Spotify = p.ExternalUrl 
                },
                Images = [.. p.ImageUrls.Select(url => new SpotifyImage { Url = url })],
                Owner = new PlaylistOwner
                {
                    DisplayName = p.OwnerDisplayName,
                    Uri = p.OwnerUri
                },
                Public = p.Public,
                SnapshotId = p.SnapshotId
            })];
        }
    }
}
