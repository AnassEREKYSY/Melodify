using Melodify.Api.Spotify;

namespace Melodify.Api.Domain;

public sealed record CountItem(string Name, int Count);
public sealed record StatsDto(
    string Range, int ArtistCount, int TrackCount, CountItem[] TopGenres, CountItem[] Decades, int[] PlaysByHour,
    int RecentPlays, int RecentMinutes, double? AveragePopularity, int ExplicitPercent, int AverageTrackSeconds, string? FirstPlayedAt);

/// <summary>Pure computations over Spotify data (unit tested without network).</summary>
public static class ListeningStats
{
    public static StatsDto Compute(string range, IReadOnlyList<ArtistDto> artists, IReadOnlyList<TrackDto> tracks, IReadOnlyList<TrackDto> recent, int utcOffsetMinutes = 0)
    {
        // Genres: how many of your top artists play them; ties go to the genre of higher-ranked artists.
        var genreScores = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        for (var i = 0; i < artists.Count; i++)
            foreach (var g in artists[i].Genres)
                genreScores[g] = genreScores.GetValueOrDefault(g) + Math.Max(1, artists.Count - i);
        var topGenres = genreScores
            .Select(kv => (Name: kv.Key, Weight: kv.Value, Count: artists.Count(a => a.Genres.Contains(kv.Key, StringComparer.OrdinalIgnoreCase))))
            .OrderByDescending(x => x.Count).ThenByDescending(x => x.Weight).ThenBy(x => x.Name).Take(8)
            .Select(x => new CountItem(Title(x.Name), x.Count)).ToArray();

        var decades = tracks.Select(t => Decade(t.Album?.ReleaseDate)).Where(d => d is not null)
            .GroupBy(d => d!).Select(g => new CountItem(g.Key, g.Count())).OrderBy(c => c.Name).ToArray();

        var hours = new int[24];
        foreach (var r in recent)
            if (DateTimeOffset.TryParse(r.PlayedAt, out var at))
                hours[((at.UtcDateTime.Hour * 60 + at.UtcDateTime.Minute + utcOffsetMinutes) % 1440 + 1440) % 1440 / 60]++;

        var pops = tracks.Where(t => t.Popularity is not null).Select(t => (double)t.Popularity!.Value).ToList();
        return new StatsDto(
            range, artists.Count, tracks.Count, topGenres, decades, hours,
            recent.Count, (int)Math.Round(recent.Sum(r => r.DurationMs) / 60000.0),
            pops.Count > 0 ? Math.Round(pops.Average(), 1) : null,
            tracks.Count > 0 ? (int)Math.Round(100.0 * tracks.Count(t => t.Explicit) / tracks.Count) : 0,
            tracks.Count > 0 ? (int)Math.Round(tracks.Average(t => t.DurationMs) / 1000.0) : 0,
            recent.Select(r => r.PlayedAt).Where(p => p is not null).Min());
    }

    internal static string? Decade(string? releaseDate) =>
        releaseDate is { Length: >= 4 } && int.TryParse(releaseDate[..4], out var y) && y > 1900 ? $"{y / 10 * 10}s" : null;

    /// <summary>"alt r&amp;b" → "Alt R&amp;B", "lo-fi beats" → "Lo-Fi Beats".</summary>
    internal static string Title(string s) => string.Join(' ', s.Split(' ').Select(w =>
        w.Contains('&') ? w.ToUpperInvariant() : string.Join('-', w.Split('-').Select(p => p.Length > 0 ? char.ToUpperInvariant(p[0]) + p[1..] : p))));
}
