using Melodify.Api.Spotify;

namespace Melodify.Api.Domain;

public sealed record PlaylistStatsDto(
    int TrackCount, int TotalMinutes, double? AveragePopularity, int ExplicitPercent, CountItem[] TopArtists, CountItem[] Decades, int Duplicates);

/// <summary>Pure playlist operations: they return the new order of track URIs, the endpoint writes it.</summary>
public static class PlaylistTools
{
    /// <summary>Same Spotify id, or same title and main artist (a single and its album version).</summary>
    public static string Key(TrackDto t) =>
        $"{Normalize(t.Name)}|{Normalize(t.Artists.FirstOrDefault()?.Name ?? "")}";

    public static (List<TrackDto> Kept, int Removed) Dedupe(IEnumerable<TrackDto> tracks)
    {
        var seenIds = new HashSet<string>();
        var seenKeys = new HashSet<string>();
        var kept = new List<TrackDto>();
        var removed = 0;
        foreach (var t in tracks)
        {
            if (t.IsLocal) { kept.Add(t); continue; }
            var newId = seenIds.Add(t.Id);
            var newKey = seenKeys.Add(Key(t));
            if (newId && newKey) kept.Add(t); else removed++;
        }
        return (kept, removed);
    }

    public static List<TrackDto> Sort(IEnumerable<TrackDto> tracks, string by, bool descending)
    {
        Func<TrackDto, IComparable> key = by switch
        {
            "title" => t => Normalize(t.Name),
            "artist" => t => Normalize(t.Artists.FirstOrDefault()?.Name ?? ""),
            "release" => t => t.Album?.ReleaseDate ?? "",
            "popularity" => t => t.Popularity ?? -1,
            "duration" => t => t.DurationMs,
            "added" => t => t.AddedAt ?? "",
            _ => throw new AppException(400, "Unknown sort. Use title, artist, release, popularity, duration or added."),
        };
        // Stable: equal keys keep their current order.
        var indexed = tracks.Select((t, i) => (t, i));
        var ordered = descending
            ? indexed.OrderByDescending(x => key(x.t)).ThenBy(x => x.i)
            : indexed.OrderBy(x => key(x.t)).ThenBy(x => x.i);
        return ordered.Select(x => x.t).ToList();
    }

    public static List<TrackDto> Merge(IEnumerable<IEnumerable<TrackDto>> lists, bool dedupe)
    {
        var all = lists.SelectMany(l => l).Where(t => !t.IsLocal);
        return dedupe ? Dedupe(all).Kept : all.ToList();
    }

    public static PlaylistStatsDto Stats(IReadOnlyList<TrackDto> tracks)
    {
        var pops = tracks.Where(t => t.Popularity is not null).Select(t => (double)t.Popularity!.Value).ToList();
        return new PlaylistStatsDto(
            tracks.Count,
            (int)Math.Round(tracks.Sum(t => (long)t.DurationMs) / 60000.0),
            pops.Count > 0 ? Math.Round(pops.Average(), 1) : null,
            tracks.Count > 0 ? (int)Math.Round(100.0 * tracks.Count(t => t.Explicit) / tracks.Count) : 0,
            tracks.SelectMany(t => t.Artists.Take(1)).GroupBy(a => a.Name).Select(g => new CountItem(g.Key, g.Count()))
                .OrderByDescending(c => c.Count).ThenBy(c => c.Name).Take(8).ToArray(),
            tracks.Select(t => ListeningStats.Decade(t.Album?.ReleaseDate)).Where(d => d is not null)
                .GroupBy(d => d!).Select(g => new CountItem(g.Key, g.Count())).OrderBy(c => c.Name).ToArray(),
            Dedupe(tracks).Removed);
    }

    static string Normalize(string s)
    {
        // "Song - Remastered 2011" and "Song (feat. X)" count as the same song.
        var cut = s.IndexOfAny(['(', '[']);
        var dash = s.IndexOf(" - ", StringComparison.Ordinal);
        var end = new[] { cut, dash }.Where(i => i > 0).DefaultIfEmpty(s.Length).Min();
        return s[..end].Trim().ToLowerInvariant();
    }
}
