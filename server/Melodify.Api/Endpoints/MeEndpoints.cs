using System.Text.Json;
using Melodify.Api.Domain;
using Melodify.Api.Spotify;
using static Melodify.Api.Endpoints.Http;

namespace Melodify.Api.Endpoints;

/// <summary>Profile, top items, recently played, saved tracks and listening stats.</summary>
public static class MeEndpoints
{
    public static void MapMe(this RouteGroupBuilder api)
    {
        api.MapGet("/me", async (HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
            Map.User((await s.GetAsync(ctx.Token(), "me", ct))!.Value));

        api.MapGet("/me/top/artists", async (string? range, int? limit, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
            (await TopArtists(s, ctx.Token(), TimeRange(range), Clamp(limit, 1, 50, 20), ct)).ToArray());

        api.MapGet("/me/top/tracks", async (string? range, int? limit, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
            (await TopTracks(s, ctx.Token(), TimeRange(range), Clamp(limit, 1, 50, 20), ct)).ToArray());

        api.MapGet("/me/recent", async (HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
            (await Recent(s, ctx.Token(), ct)).ToArray());

        api.MapGet("/me/stats", async (string? range, int? tz, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            var t = ctx.Token(); var r = TimeRange(range);
            var artists = TopArtists(s, t, r, 50, ct);
            var tracks = TopTracks(s, t, r, 50, ct);
            var recent = Recent(s, t, ct);
            await Task.WhenAll(artists, tracks, recent);
            return ListeningStats.Compute(r, artists.Result, tracks.Result, recent.Result, Clamp(tz, -840, 840, 0));
        });

        api.MapGet("/me/tracks", async (int? offset, int? limit, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            var l = Clamp(limit, 1, 50, 50); var o = Clamp(offset, 0, 100000, 0);
            var page = (await s.GetAsync(ctx.Token(), $"me/tracks?limit={l}&offset={o}", ct))!.Value;
            return new Paged<TrackDto>(page.GetProperty("items").EnumerateArray().Select(Map.Item).OfType<TrackDto>().ToArray(),
                page.GetProperty("total").GetInt32(), o, l);
        });

        api.MapGet("/me/tracks/contains", async (string ids, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            var list = ids.Split(',', StringSplitOptions.RemoveEmptyEntries).Take(50).ToArray();
            foreach (var id in list) ValidateId(id);
            if (list.Length == 0) return Array.Empty<bool>();
            var result = new List<bool>(list.Length);
            foreach (var chunk in list.Chunk(40)) // /me/library/contains takes 40 URIs at most
            {
                var r = (await s.GetAsync(ctx.Token(), $"me/library/contains?uris={Uris("track", chunk)}", ct))!.Value;
                result.AddRange(r.EnumerateArray().Select(x => x.GetBoolean()));
            }
            return result.ToArray();
        });

        api.MapPut("/me/tracks/{id}", async (string id, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            await s.SendAsync(HttpMethod.Put, ctx.Token(), $"me/library?uris={Uris("track", [id])}", null, ct);
            return Results.NoContent();
        });

        api.MapDelete("/me/tracks/{id}", async (string id, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            ValidateId(id);
            await s.SendAsync(HttpMethod.Delete, ctx.Token(), $"me/library?uris={Uris("track", [id])}", null, ct);
            return Results.NoContent();
        });
    }

    internal static async Task<List<ArtistDto>> TopArtists(SpotifyClient s, string t, string range, int limit, CancellationToken ct)
    {
        var r = (await s.GetAsync(t, $"me/top/artists?time_range={range}&limit={limit}", ct))!.Value;
        return r.GetProperty("items").EnumerateArray().Select(Map.Artist).ToList();
    }

    internal static async Task<List<TrackDto>> TopTracks(SpotifyClient s, string t, string range, int limit, CancellationToken ct)
    {
        var r = (await s.GetAsync(t, $"me/top/tracks?time_range={range}&limit={limit}", ct))!.Value;
        return r.GetProperty("items").EnumerateArray().Select(x => Map.Track(x)).OfType<TrackDto>().ToList();
    }

    internal static async Task<List<TrackDto>> Recent(SpotifyClient s, string t, CancellationToken ct)
    {
        var r = (await s.GetAsync(t, "me/player/recently-played?limit=50", ct))!.Value;
        return r.GetProperty("items").EnumerateArray().Select(Map.Item).OfType<TrackDto>().ToList();
    }
}
