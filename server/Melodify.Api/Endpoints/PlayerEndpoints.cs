using Melodify.Api.Spotify;
using static Melodify.Api.Endpoints.Http;

namespace Melodify.Api.Endpoints;

/// <summary>Spotify Connect remote control. Spotify requires Premium for every write action.</summary>
public static class PlayerEndpoints
{
    public sealed record PlayBody(string? DeviceId, string? ContextUri, string[]? Uris, int? Offset);
    public sealed record DeviceBody(string DeviceId, bool? Play);

    public static void MapPlayer(this RouteGroupBuilder api)
    {
        var g = api.MapGroup("/player");

        g.MapGet("/", async (HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
            await s.GetAsync(ctx.Token(), "me/player?additional_types=track", ct) is { } st ? Results.Ok(Map.Player(st)) : Results.NoContent());

        g.MapGet("/devices", async (HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
            (await s.GetAsync(ctx.Token(), "me/player/devices", ct))!.Value.GetProperty("devices").EnumerateArray().Select(Map.Device).ToArray());

        g.MapPut("/play", async (PlayBody b, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            object? body = null;
            if (b.ContextUri is { } c)
            {
                if (!c.StartsWith("spotify:", StringComparison.Ordinal) || c.Length > 80) throw new AppException(400, "Invalid context.");
                body = b.Offset is { } o ? new { context_uri = c, offset = new { position = Math.Max(0, o) } } : new { context_uri = c };
            }
            else if (b.Uris is { Length: > 0 } u)
            {
                if (u.Length > 100 || u.Any(x => !x.StartsWith("spotify:track:", StringComparison.Ordinal))) throw new AppException(400, "Invalid tracks.");
                body = b.Offset is { } o ? new { uris = u, offset = new { position = Math.Max(0, o) } } : new { uris = u };
            }
            await s.SendAsync(HttpMethod.Put, ctx.Token(), $"me/player/play{Device(b.DeviceId)}", body, ct);
            return Results.NoContent();
        });

        g.MapPut("/pause", async (HttpContext ctx, SpotifyClient s, CancellationToken ct) => { await s.SendAsync(HttpMethod.Put, ctx.Token(), "me/player/pause", null, ct); return Results.NoContent(); });
        g.MapPost("/next", async (HttpContext ctx, SpotifyClient s, CancellationToken ct) => { await s.SendAsync(HttpMethod.Post, ctx.Token(), "me/player/next", null, ct); return Results.NoContent(); });
        g.MapPost("/previous", async (HttpContext ctx, SpotifyClient s, CancellationToken ct) => { await s.SendAsync(HttpMethod.Post, ctx.Token(), "me/player/previous", null, ct); return Results.NoContent(); });

        g.MapPut("/device", async (DeviceBody b, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(b.DeviceId) || b.DeviceId.Length > 100) throw new AppException(400, "Pick a device.");
            await s.SendAsync(HttpMethod.Put, ctx.Token(), "me/player", new { device_ids = new[] { b.DeviceId }, play = b.Play ?? true }, ct);
            return Results.NoContent();
        });

        g.MapPut("/volume", async (int percent, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            await s.SendAsync(HttpMethod.Put, ctx.Token(), $"me/player/volume?volume_percent={Math.Clamp(percent, 0, 100)}", null, ct);
            return Results.NoContent();
        });

        g.MapPut("/seek", async (int positionMs, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            await s.SendAsync(HttpMethod.Put, ctx.Token(), $"me/player/seek?position_ms={Math.Max(0, positionMs)}", null, ct);
            return Results.NoContent();
        });

        g.MapPut("/shuffle", async (bool state, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            await s.SendAsync(HttpMethod.Put, ctx.Token(), $"me/player/shuffle?state={(state ? "true" : "false")}", null, ct);
            return Results.NoContent();
        });

        g.MapPut("/repeat", async (string state, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            if (state is not ("off" or "context" or "track")) throw new AppException(400, "Repeat is off, context or track.");
            await s.SendAsync(HttpMethod.Put, ctx.Token(), $"me/player/repeat?state={state}", null, ct);
            return Results.NoContent();
        });

        g.MapPost("/queue", async (string uri, HttpContext ctx, SpotifyClient s, CancellationToken ct) =>
        {
            if (!uri.StartsWith("spotify:track:", StringComparison.Ordinal) || uri.Length > 60) throw new AppException(400, "Invalid track.");
            await s.SendAsync(HttpMethod.Post, ctx.Token(), $"me/player/queue?uri={Uri.EscapeDataString(uri)}", null, ct);
            return Results.NoContent();
        });
    }

    static string Device(string? id) => string.IsNullOrWhiteSpace(id) ? "" : $"?device_id={Uri.EscapeDataString(id)}";
}
