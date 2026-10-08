using Melodify.Api.Domain;

namespace Melodify.Tests;

public class ListeningStatsTests
{
    [Fact]
    public void Top_genres_count_artists_and_break_ties_by_rank()
    {
        var artists = new[]
        {
            F.Artist("A", "jazz rap", "neo soul"),
            F.Artist("B", "indie pop"),
            F.Artist("C", "neo soul"),
            F.Artist("D", "chanson"),
        };
        var s = ListeningStats.Compute("medium_term", artists, [], []);
        Assert.Equal("Neo Soul", s.TopGenres[0].Name);
        Assert.Equal(2, s.TopGenres[0].Count);
        Assert.Equal("Jazz Rap", s.TopGenres[1].Name); // from the #1 artist
    }

    [Fact]
    public void Plays_by_hour_use_the_given_utc_offset()
    {
        var recent = new[]
        {
            F.Track("1", "A", playedAt: "2026-10-08T21:30:00Z", durationMs: 120_000),
            F.Track("2", "B", playedAt: "2026-10-08T23:10:00Z", durationMs: 180_000),
        };
        var s = ListeningStats.Compute("short_term", [], [], recent, utcOffsetMinutes: 120);
        Assert.Equal(1, s.PlaysByHour[23]);
        Assert.Equal(1, s.PlaysByHour[1]); // 23:10 UTC is 01:10 in Paris (summer)
        Assert.Equal(5, s.RecentMinutes);
        Assert.Equal("2026-10-08T21:30:00Z", s.FirstPlayedAt);
    }

    [Fact]
    public void Decades_and_averages_from_top_tracks()
    {
        var tracks = new[]
        {
            F.Track("1", "A", release: "1994-03-01", popularity: 40, @explicit: true),
            F.Track("2", "B", release: "1999", popularity: 60),
            F.Track("3", "C", release: null, popularity: null),
        };
        var s = ListeningStats.Compute("long_term", [], tracks, []);
        Assert.Equal("1990s", Assert.Single(s.Decades).Name);
        Assert.Equal(50, s.AveragePopularity);
        Assert.Equal(33, s.ExplicitPercent);
    }

    [Fact]
    public void Empty_input_gives_zeros()
    {
        var s = ListeningStats.Compute("short_term", [], [], []);
        Assert.Empty(s.TopGenres);
        Assert.Null(s.AveragePopularity);
        Assert.Equal(24, s.PlaysByHour.Length);
    }

    [Theory]
    [InlineData("alt r&b", "Alt R&B")]
    [InlineData("lo-fi beats", "Lo-Fi Beats")]
    [InlineData("jazz rap", "Jazz Rap")]
    public void Genre_names_are_title_cased(string raw, string expected) => Assert.Equal(expected, ListeningStats.Title(raw));
}
