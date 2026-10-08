using Microsoft.AspNetCore.Mvc;
using Melodify.Api.Domain;
using Melodify.Api.Spotify;
using static Melodify.Api.Endpoints.Http;

namespace Melodify.Api.Endpoints;

/// <summary>Playlists: list, details, create/edit/delete, add/remove tracks, and the playlist tools.</summary>
public static class PlaylistEndpoints
{
    const int MaxTracks = 5000;

    public static void MapPlaylists(this RouteGroupBuilder api)
    {
        var g = api.MapGroup("/playlists");

        g.MapGet("/", async (HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            var t = ctx.Token();
            var meId = await MeId(s, t, ct);
            var items = await s.GetAllAsync(t, "me/playlists?limit=50", 500, ct);
            return items.Select(p => Map.Playlist(p, meId)).ToArray();
        });

        g.MapGet("/{id}", async (string id, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            var t = ctx.Token();
            var (playlist, tracks, skipped) = await Load(s, t, id, ct);
            return new PlaylistDetailDto(playlist, tracks.ToArray(), skipped);
        });

        g.MapGet("/{id}/stats", async (string id, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            var (_, tracks, _) = await Load(s, ctx.Token(), id, ct);
            return PlaylistTools.Stats(tracks);
        });

        g.MapPost("/", async (CreateBody b, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            var t = ctx.Token();
            var p = await Create(s, t, b.Name, b.Description, b.Public ?? false, ct);
            return Results.Created($"/api/playlists/{p.Id}", p);
        });

        g.MapPut("/{id}", async (string id, CreateBody b, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            var name = CheckName(b.Name);
            await s.SendAsync(HttpMethod.Put, ctx.Token(), $"playlists/{id}", new { name, description = b.Description?.Trim() ?? "", @public = b.Public ?? false }, ct);
            return Results.NoContent();
        });

        // Spotify has no real delete: removing it from your library ("unfollow").
        g.MapDelete("/{id}", async (string id, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            await s.SendAsync(HttpMethod.Delete, ctx.Token(), $"playlists/{id}/followers", null, ct);
            return Results.NoContent();
        });

        g.MapPost("/{id}/tracks", async (string id, UrisBody b, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            var uris = CheckUris(b.Uris);
            foreach (var chunk in uris.Chunk(100))
                await s.SendAsync(HttpMethod.Post, ctx.Token(), $"playlists/{id}/tracks", new { uris = chunk }, ct);
            return Results.NoContent();
        });

        g.MapDelete("/{id}/tracks", async (string id, [FromBody] UrisBody b, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            var uris = CheckUris(b.Uris);
            foreach (var chunk in uris.Chunk(100))
                await s.SendAsync(HttpMethod.Delete, ctx.Token(), $"playlists/{id}/tracks", new { tracks = chunk.Select(u => new { uri = u }) }, ct);
            return Results.NoContent();
        });

        // Tools ---------------------------------------------------------------

        g.MapPost("/{id}/dedupe", async (string id, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            var t = ctx.Token();
            var (p, tracks, skipped) = await LoadOwn(s, t, id, ct);
            var (kept, removed) = PlaylistTools.Dedupe(tracks);
            if (removed > 0) await Replace(s, t, p.Id, kept.Select(x => x.Uri), ct);
            return new { removed, trackCount = kept.Count, skippedLocal = skipped };
        });

        g.MapPost("/{id}/sort", async (string id, SortBody b, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            var t = ctx.Token();
            var (p, tracks, _) = await LoadOwn(s, t, id, ct);
            var sorted = PlaylistTools.Sort(tracks, b.By ?? "title", b.Descending ?? false);
            await Replace(s, t, p.Id, sorted.Select(x => x.Uri), ct);
            return new { trackCount = sorted.Count };
        });

        g.MapPost("/merge", async (MergeBody b, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            var ids = (b.PlaylistIds ?? []).Distinct().ToArray();
            if (ids.Length < 2 || ids.Length > 10) throw new AppException(400, "Pick between 2 and 10 playlists.");
            foreach (var id in ids) ValidateId(id);
            var t = ctx.Token();
            var loaded = await Task.WhenAll(ids.Select(id => Load(s, t, id, ct)));
            var merged = PlaylistTools.Merge(loaded.Select(l => l.Tracks), b.RemoveDuplicates ?? true);
            if (merged.Count == 0) throw new AppException(400, "These playlists have no tracks to merge.");
            var name = string.IsNullOrWhiteSpace(b.Name) ? string.Join(" + ", loaded.Select(l => l.Playlist.Name)).Truncate(90) : b.Name!;
            var created = await Create(s, t, name, $"Merged with Melodify from {loaded.Length} playlists.", false, ct);
            await Replace(s, t, created.Id, merged.Select(x => x.Uri), ct);
            return Results.Created($"/api/playlists/{created.Id}", created with { TrackCount = merged.Count });
        });

        g.MapPost("/from-top", async (FromTopBody b, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            var t = ctx.Token();
            var range = TimeRange(b.Range);
            var limit = Clamp(b.Limit, 5, 50, 30);
            var tracks = await MeEndpoints.TopTracks(s, t, range, limit, ct);
            if (tracks.Count == 0) throw new AppException(409, "Spotify has no top tracks for you yet. Listen a bit more and try again.");
            var label = range switch { "short_term" => "last 4 weeks", "long_term" => "all time", _ => "last 6 months" };
            var name = string.IsNullOrWhiteSpace(b.Name) ? $"My top {tracks.Count}, {label}" : b.Name!;
            var created = await Create(s, t, name, $"Your most played tracks ({label}), made with Melodify.", false, ct);
            await Replace(s, t, created.Id, tracks.Select(x => x.Uri), ct);
            return Results.Created($"/api/playlists/{created.Id}", created with { TrackCount = tracks.Count });
        });
    }

    public sealed record CreateBody(string Name, string? Description, bool? Public);
    public sealed record UrisBody(string[] Uris);
    public sealed record SortBody(string? By, bool? Descending);
    public sealed record MergeBody(string[]? PlaylistIds, string? Name, bool? RemoveDuplicates);
    public sealed record FromTopBody(string? Range, int? Limit, string? Name);

    static async Task<string> MeId(SpotifyClient s, string t, CancellationToken ct) =>
        (await s.GetAsync(t, "me", ct))!.Value.GetProperty("id").GetString()!;

    internal static async Task<(PlaylistDto Playlist, List<TrackDto> Tracks, int Skipped)> Load(SpotifyClient s, string t, string id, CancellationToken ct)
    {
        var meTask = MeId(s, t, ct);
        var pTask = s.GetAsync(t, $"playlists/{id}?fields=id,uri,name,description,images,owner(id,display_name),public,collaborative,snapshot_id,tracks(total)", ct);
        var itemsTask = s.GetAllAsync(t, $"playlists/{id}/tracks?limit=100", MaxTracks, ct);
        await Task.WhenAll(meTask, pTask, itemsTask);
        var all = itemsTask.Result.Select(Map.Item).ToList();
        var tracks = all.OfType<TrackDto>().ToList();
        return (Map.Playlist(pTask.Result!.Value, meTask.Result), tracks, all.Count - tracks.Count + tracks.Count(x => x.IsLocal));
    }

    /// <summary>Rewriting a playlist is only allowed on your own playlists without local files (Spotify cannot re-add them).</summary>
    static async Task<(PlaylistDto, List<TrackDto>, int)> LoadOwn(SpotifyClient s, string t, string id, CancellationToken ct)
    {
        var (p, tracks, skipped) = await Load(s, t, id, ct);
        if (!p.IsOwn) throw new AppException(403, "You can only change your own playlists.");
        if (tracks.Any(x => x.IsLocal)) throw new AppException(409, "This playlist has local files, which Spotify does not let apps re-add. Remove them first.");
        if (tracks.Count >= MaxTracks) throw new AppException(409, $"Playlists over {MaxTracks} tracks are not supported.");
        return (p, tracks, skipped);
    }

    /// <summary>Replaces all items: first 100 with PUT, the rest appended in batches.</summary>
    static async Task Replace(SpotifyClient s, string t, string playlistId, IEnumerable<string> uris, CancellationToken ct)
    {
        var list = uris.ToList();
        await s.SendAsync(HttpMethod.Put, t, $"playlists/{playlistId}/tracks", new { uris = list.Take(100).ToArray() }, ct);
        foreach (var chunk in list.Skip(100).Chunk(100))
            await s.SendAsync(HttpMethod.Post, t, $"playlists/{playlistId}/tracks", new { uris = chunk }, ct);
    }

    static async Task<PlaylistDto> Create(SpotifyClient s, string t, string name, string? description, bool isPublic, CancellationToken ct)
    {
        var meId = await MeId(s, t, ct);
        var p = await s.SendAsync(HttpMethod.Post, t, $"users/{Uri.EscapeDataString(meId)}/playlists",
            new { name = CheckName(name), description = description?.Trim() ?? "", @public = isPublic }, ct);
        return Map.Playlist(p!.Value, meId);
    }

    static string CheckName(string? name)
    {
        var n = name?.Trim() ?? "";
        if (n.Length is 0 or > 100) throw new AppException(400, "Give the playlist a name (100 characters max).");
        return n;
    }

    static string[] CheckUris(string[]? uris)
    {
        var list = (uris ?? []).Distinct().ToArray();
        if (list.Length is 0 or > 500) throw new AppException(400, "Send between 1 and 500 track URIs.");
        if (list.Any(u => !u.StartsWith("spotify:track:", StringComparison.Ordinal) || u.Length > 60)) throw new AppException(400, "Invalid track URI.");
        return list;
    }

    static string Truncate(this string s, int n) => s.Length <= n ? s : s[..n].TrimEnd() + "…";
}
