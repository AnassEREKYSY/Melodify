using System.Text.Json;
using Melodify.Api.Spotify;

namespace Melodify.Tests;

public class MapTests
{
    static JsonElement J(string json) => JsonDocument.Parse(json).RootElement;

    [Fact]
    public void Playlist_item_maps_track_and_added_date()
    {
        var item = J("""{"added_at":"2026-01-01T00:00:00Z","track":{"id":"t1","uri":"spotify:track:t1","name":"Song","type":"track","duration_ms":1000,"explicit":true,"popularity":70,"artists":[{"id":"a","name":"Artist"}],"album":{"id":"al","name":"Album","release_date":"2020","images":[{"url":"https://img/1"}]}}}""");
        var t = Map.Item(item)!;
        Assert.Equal("Song", t.Name);
        Assert.Equal("Artist", t.Artists[0].Name);
        Assert.Equal("https://img/1", t.Album!.Image);
        Assert.Equal("2026-01-01T00:00:00Z", t.AddedAt);
        Assert.True(t.Explicit);
    }

    [Fact]
    public void Episodes_and_removed_tracks_are_skipped()
    {
        Assert.Null(Map.Item(J("""{"track":{"type":"episode","id":"e"}}""")));
        Assert.Null(Map.Item(J("""{"track":null}""")));
    }

    [Fact]
    public void Playlist_ownership_is_detected()
    {
        var p = J("""{"id":"p","uri":"u","name":"Mine","owner":{"id":"me"},"tracks":{"total":3},"public":false,"collaborative":false}""");
        Assert.True(Map.Playlist(p, "me").IsOwn);
        Assert.False(Map.Playlist(p, "someone").IsOwn);
        Assert.Equal(3, Map.Playlist(p, "me").TrackCount);
    }
}
