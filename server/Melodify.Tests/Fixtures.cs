using Melodify.Api.Spotify;

namespace Melodify.Tests;

internal static class F
{
    public static TrackDto Track(string id, string name, string artist = "Artist", string? release = "2020-01-01", int? popularity = 50,
        int durationMs = 200_000, bool @explicit = false, string? playedAt = null, bool local = false, string? addedAt = null) =>
        new(id, $"spotify:track:{id}", name, [new ArtistRef("a-" + artist, artist)], new AlbumRef("al", "Album", null, release),
            durationMs, @explicit, popularity, null, addedAt, playedAt, local);

    public static ArtistDto Artist(string name, params string[] genres) => new("id-" + name, "spotify:artist:" + name, name, null, genres, 100, 50);
}
