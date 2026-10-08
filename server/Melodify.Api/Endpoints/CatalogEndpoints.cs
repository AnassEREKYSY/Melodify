using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Melodify.Api.Spotify;
using static Melodify.Api.Endpoints.Http;

namespace Melodify.Api.Endpoints;

/// <summary>Artists, albums, search and new releases from followed artists.</summary>
public static class CatalogEndpoints
{
    public sealed record ArtistPage(ArtistDto Artist, TrackDto[] TopTracks, AlbumDto[] Albums, bool Following);
    public sealed record SearchResult(TrackDto[] Tracks, ArtistDto[] Artists, AlbumDto[] Albums, PlaylistDto[] Playlists);

    public static void MapCatalog(this RouteGroupBuilder api)
    {
        api.MapGet("/artists/followed", async (HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
            (await Followed(s, ctx.Token(), ct)).ToArray());

        api.MapGet("/artists/{id}", async (string id, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            var t = ctx.Token();
            var artist = Map.Artist((await s.GetAsync(t, $"artists/{id}", ct))!.Value);
            var top = TopTracks(s, t, artist, ct);
            var albums = s.GetAsync(t, $"artists/{id}/albums?include_groups=album,single&limit=10", ct);
            var following = s.GetAsync(t, $"me/library/contains?uris={Uris("artist", [id])}", ct);
            await Task.WhenAll(top, albums, following);
            return new ArtistPage(
                artist,
                top.Result,
                albums.Result!.Value.GetProperty("items").EnumerateArray().Select(a => Map.Album(a))
                    .GroupBy(a => a.Name.ToLowerInvariant()).Select(g => g.First()) // same album in several markets
                    .OrderByDescending(a => a.ReleaseDate).ToArray(),
                following.Result is { } f && f.ValueKind == System.Text.Json.JsonValueKind.Array && f.EnumerateArray().FirstOrDefault().ValueKind == System.Text.Json.JsonValueKind.True);
        });

        api.MapPut("/artists/{id}/follow", async (string id, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            await s.SendAsync(HttpMethod.Put, ctx.Token(), $"me/library?uris={Uris("artist", [id])}", null, ct);
            return Results.NoContent();
        });

        api.MapDelete("/artists/{id}/follow", async (string id, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            await s.SendAsync(HttpMethod.Delete, ctx.Token(), $"me/library?uris={Uris("artist", [id])}", null, ct);
            return Results.NoContent();
        });

        api.MapGet("/albums/{id}", async (string id, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            var a = (await s.GetAsync(ctx.Token(), $"albums/{id}", ct))!.Value;
            var albumRef = Map.AlbumRef(a);
            var tracks = a.GetProperty("tracks").GetProperty("items").EnumerateArray()
                .Select(x => Map.Track(x)).OfType<TrackDto>().Select(x => x with { Album = albumRef }).ToArray();
            return Map.Album(a, tracks);
        });

        api.MapGet("/search", async (string q, string? type, int? limit, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            q = q?.Trim() ?? "";
            if (q.Length is 0 or > 200) throw new AppException(400, "Type something to search.");
            var types = (type ?? "track,artist,album,playlist").Split(',').Where(x => x is "track" or "artist" or "album" or "playlist").DefaultIfEmpty("track");
            var l = Clamp(limit, 1, 10, 10); // Spotify caps search at 10 per type since 2026
            var r = (await s.GetAsync(ctx.Token(), $"search?q={Uri.EscapeDataString(q)}&type={string.Join(',', types)}&limit={l}", ct))!.Value;
            IEnumerable<System.Text.Json.JsonElement> Items(string k) =>
                r.TryGetProperty(k, out var x) && x.TryGetProperty("items", out var i) ? i.EnumerateArray().Where(e => e.ValueKind == System.Text.Json.JsonValueKind.Object) : [];
            return new SearchResult(
                Items("tracks").Select(x => Map.Track(x)).OfType<TrackDto>().ToArray(),
                Items("artists").Select(Map.Artist).ToArray(),
                Items("albums").Select(a => Map.Album(a)).ToArray(),
                Items("playlists").Select(p => Map.Playlist(p, null)).ToArray());
        });

        // Albums and singles from followed artists, newest first. Cached per user for 30 minutes (many calls).
        api.MapGet("/releases", async (int? days, HttpContext ctx, SpotifyClient s, IMemoryCache cache, CancellationToken ct) =>
        {
            var t = ctx.Token();
            var window = Clamp(days, 7, 365, 90);
            var me = (await s.GetAsync(t, "me", ct))!.Value.GetProperty("id").GetString()!;
            var key = $"releases:{Hash(me)}:{window}";
            if (cache.TryGetValue(key, out AlbumDto[]? hit)) return hit!;

            var artists = (await Followed(s, t, ct)).Take(60).ToList();
            var since = DateTime.UtcNow.AddDays(-window).ToString("yyyy-MM-dd");
            var gate = new SemaphoreSlim(5); // stay well under Spotify's rate limit
            var lists = await Task.WhenAll(artists.Select(async a =>
            {
                await gate.WaitAsync(ct);
                try
                {
                    var r = await s.GetAsync(t, $"artists/{a.Id}/albums?include_groups=album,single&limit=10", ct);
                    return r is { } x ? x.GetProperty("items").EnumerateArray().Select(al => Map.Album(al)).ToList() : [];
                }
                catch (SpotifyException) { return []; } // one failing artist should not break the page
                finally { gate.Release(); }
            }));
            var releases = lists.SelectMany(l => l)
                .Where(a => string.CompareOrdinal(Normalize(a.ReleaseDate), since) >= 0)
                .GroupBy(a => a.Id).Select(g => g.First())
                .OrderByDescending(a => Normalize(a.ReleaseDate)).Take(60).ToArray();
            cache.Set(key, releases, TimeSpan.FromMinutes(30));
            return releases;
        });
    }

    /// <summary>Spotify removed "artist top tracks" (2026): use the best search matches by this artist instead.</summary>
    static async Task<TrackDto[]> TopTracks(SpotifyClient s, string t, ArtistDto artist, CancellationToken ct)
    {
        try
        {
            var q = Uri.EscapeDataString($"artist:\"{artist.Name}\"");
            var r = await s.GetAsync(t, $"search?q={q}&type=track&limit=10", ct);
            if (r is not { } x || !x.TryGetProperty("tracks", out var tr)) return [];
            return tr.GetProperty("items").EnumerateArray().Where(e => e.ValueKind == System.Text.Json.JsonValueKind.Object)
                .Select(e => Map.Track(e)).OfType<TrackDto>().Where(e => e.Artists.Any(a => a.Id == artist.Id)).ToArray();
        }
        catch (SpotifyException) { return []; }
    }

    static async Task<List<ArtistDto>> Followed(SpotifyClient s, string t, CancellationToken ct)
    {
        var items = await s.GetAllAsync(t, "me/following?type=artist&limit=50", 500, ct, itemsProperty: "artists");
        return items.Select(Map.Artist).OrderBy(a => a.Name, StringComparer.OrdinalIgnoreCase).ToList();
    }

    /// <summary>"2024" or "2024-05" release dates become comparable "yyyy-MM-dd".</summary>
    internal static string Normalize(string? d) => d switch
    {
        null => "0000-00-00",
        { Length: 4 } => d + "-01-01",
        { Length: 7 } => d + "-01",
        _ => d,
    };

    static string Hash(string s) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(s)))[..16];
}
