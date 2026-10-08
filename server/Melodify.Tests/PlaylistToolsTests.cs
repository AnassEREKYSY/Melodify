using Melodify.Api.Domain;
using Melodify.Api.Spotify;

namespace Melodify.Tests;

public class PlaylistToolsTests
{
    [Fact]
    public void Dedupe_removes_same_id_and_same_song_in_another_version()
    {
        var tracks = new[]
        {
            F.Track("1", "Hello"),
            F.Track("2", "World"),
            F.Track("1", "Hello"),                      // same id
            F.Track("3", "Hello - Remastered 2011"),    // same song, other version
            F.Track("4", "Hello (feat. Someone)"),      // same song, other version
            F.Track("5", "Hello", artist: "Other"),     // other artist: kept
        };
        var (kept, removed) = PlaylistTools.Dedupe(tracks);
        Assert.Equal(3, removed);
        Assert.Equal(new[] { "1", "2", "5" }, kept.Select(t => t.Id));
    }

    [Fact]
    public void Dedupe_keeps_local_files()
    {
        var (kept, removed) = PlaylistTools.Dedupe([F.Track("", "Demo", local: true), F.Track("", "Demo", local: true)]);
        Assert.Equal(0, removed);
        Assert.Equal(2, kept.Count);
    }

    [Theory]
    [InlineData("title", false, new[] { "a", "b", "c" })]
    [InlineData("title", true, new[] { "c", "b", "a" })]
    [InlineData("release", false, new[] { "b", "c", "a" })]
    [InlineData("popularity", true, new[] { "c", "a", "b" })]
    public void Sort_orders_tracks(string by, bool desc, string[] expected)
    {
        var tracks = new[]
        {
            F.Track("a", "Alpha", release: "2021-01-01", popularity: 50),
            F.Track("b", "Bravo", release: "1999", popularity: 10),
            F.Track("c", "Charlie", release: "2005-06", popularity: 90),
        };
        Assert.Equal(expected, PlaylistTools.Sort(tracks, by, desc).Select(t => t.Id));
    }

    [Fact]
    public void Sort_is_stable_for_equal_keys()
    {
        var tracks = new[] { F.Track("x", "Same", artist: "A"), F.Track("y", "Same", artist: "B"), F.Track("z", "Same", artist: "C") };
        Assert.Equal(new[] { "x", "y", "z" }, PlaylistTools.Sort(tracks, "title", false).Select(t => t.Id));
    }

    [Fact]
    public void Sort_rejects_unknown_key()
    {
        var ex = Assert.Throws<AppException>(() => PlaylistTools.Sort([F.Track("a", "A")], "mood", false));
        Assert.Equal(400, ex.Status);
    }

    [Fact]
    public void Merge_concatenates_in_order_and_dedupes_across_playlists()
    {
        var merged = PlaylistTools.Merge([[F.Track("1", "One"), F.Track("2", "Two")], [F.Track("2", "Two"), F.Track("3", "Three")]], dedupe: true);
        Assert.Equal(new[] { "1", "2", "3" }, merged.Select(t => t.Id));
        Assert.Equal(4, PlaylistTools.Merge([[F.Track("1", "One"), F.Track("2", "Two")], [F.Track("2", "Two"), F.Track("3", "Three")]], dedupe: false).Count);
    }

    [Fact]
    public void Stats_sums_duration_and_counts_duplicates()
    {
        var s = PlaylistTools.Stats([
            F.Track("1", "One", durationMs: 180_000, @explicit: true, release: "1985-01-01"),
            F.Track("2", "Two", durationMs: 240_000, release: "1987-01-01"),
            F.Track("1", "One", durationMs: 180_000, @explicit: true, release: "1985-01-01"),
        ]);
        Assert.Equal(3, s.TrackCount);
        Assert.Equal(10, s.TotalMinutes);
        Assert.Equal(67, s.ExplicitPercent);
        Assert.Equal(1, s.Duplicates);
        Assert.Equal(new CountItem("1980s", 3), Assert.Single(s.Decades));
    }
}
