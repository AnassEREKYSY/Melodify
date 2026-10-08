using System.Text.Json;

namespace Melodify.Api.Spotify;

/// <summary>Spotify JSON to the compact DTOs the client uses.</summary>
public static class Map
{
    static string? Str(this JsonElement e, string p) => e.ValueKind == JsonValueKind.Object && e.TryGetProperty(p, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;
    static int? Int(this JsonElement e, string p) => e.ValueKind == JsonValueKind.Object && e.TryGetProperty(p, out var v) && v.ValueKind == JsonValueKind.Number ? v.GetInt32() : null;
    static bool Bool(this JsonElement e, string p) => e.ValueKind == JsonValueKind.Object && e.TryGetProperty(p, out var v) && v.ValueKind == JsonValueKind.True;
    static JsonElement? Obj(this JsonElement e, string p) => e.ValueKind == JsonValueKind.Object && e.TryGetProperty(p, out var v) && v.ValueKind == JsonValueKind.Object ? v : null;
    static IEnumerable<JsonElement> Arr(this JsonElement e, string p) => e.ValueKind == JsonValueKind.Object && e.TryGetProperty(p, out var v) && v.ValueKind == JsonValueKind.Array ? v.EnumerateArray() : [];

    /// <summary>Largest image under ~640px (Spotify lists them largest first).</summary>
    public static string? Image(JsonElement e) => e.Arr("images").Select(i => i.Str("url")).FirstOrDefault(u => u is not null);

    public static ArtistRef ArtistRef(JsonElement a) => new(a.Str("id") ?? "", a.Str("name") ?? "");

    public static AlbumRef? AlbumRef(JsonElement? a) => a is { } x ? new(x.Str("id") ?? "", x.Str("name") ?? "", Image(x), x.Str("release_date")) : null;

    public static TrackDto? Track(JsonElement t, string? addedAt = null, string? playedAt = null)
    {
        if (t.ValueKind != JsonValueKind.Object || t.Str("type") is "episode") return null;
        var isLocal = t.Bool("is_local");
        return new TrackDto(
            t.Str("id") ?? "", t.Str("uri") ?? "", t.Str("name") ?? "",
            t.Arr("artists").Select(ArtistRef).ToArray(),
            AlbumRef(t.Obj("album")),
            t.Int("duration_ms") ?? 0, t.Bool("explicit"), t.Int("popularity"), t.Str("preview_url"),
            addedAt, playedAt, isLocal);
    }

    /// <summary>Playlist/saved-track/recently-played items wrap the track.</summary>
    /// <remarks>Playlist items now use "item" (2026 API); saved tracks and recent plays still use "track".</remarks>
    public static TrackDto? Item(JsonElement it) =>
        (it.Obj("item") ?? it.Obj("track")) is { } t ? Track(t, it.Str("added_at"), it.Str("played_at")) : null;

    public static ArtistDto Artist(JsonElement a) => new(
        a.Str("id") ?? "", a.Str("uri") ?? "", a.Str("name") ?? "", Image(a),
        a.Arr("genres").Select(g => g.GetString() ?? "").Where(g => g != "").ToArray(),
        a.Obj("followers")?.Int("total"), a.Int("popularity"));

    public static AlbumDto Album(JsonElement a, TrackDto[]? tracks = null) => new(
        a.Str("id") ?? "", a.Str("uri") ?? "", a.Str("name") ?? "", a.Str("album_type") ?? "album", Image(a), a.Str("release_date"),
        a.Int("total_tracks") ?? 0, a.Arr("artists").Select(ArtistRef).ToArray(), tracks, a.Str("label"));

    public static PlaylistDto Playlist(JsonElement p, string? meId)
    {
        var owner = p.Obj("owner");
        var ownerId = owner?.Str("id") ?? "";
        var total = p.Obj("items")?.Int("total") ?? p.Obj("tracks")?.Int("total") ?? 0;
        return new PlaylistDto(
            p.Str("id") ?? "", p.Str("uri") ?? "", p.Str("name") ?? "", NullIfEmpty(p.Str("description")), Image(p),
            new OwnerDto(ownerId, owner?.Str("display_name")), total, p.Bool("public"), p.Bool("collaborative"),
            p.Str("snapshot_id"), meId is not null && (ownerId == meId || p.Bool("collaborative")));
    }

    public static UserDto User(JsonElement u) => new(
        u.Str("id") ?? "", u.Str("display_name"), u.Str("email"), Image(u), u.Str("country"), u.Str("product"), u.Obj("followers")?.Int("total"));

    public static DeviceDto Device(JsonElement d) => new(
        d.Str("id"), d.Str("name") ?? "Device", d.Str("type") ?? "Unknown", d.Bool("is_active"), d.Bool("is_restricted"), d.Int("volume_percent"));

    public static PlayerStateDto Player(JsonElement s) => new(
        s.Bool("is_playing"), s.Int("progress_ms") ?? 0,
        s.Obj("device") is { } d ? Device(d) : null,
        s.Obj("item") is { } t ? Track(t) : null,
        s.Bool("shuffle_state"), s.Str("repeat_state") ?? "off", s.Obj("context")?.Str("uri"));

    static string? NullIfEmpty(string? s) => string.IsNullOrWhiteSpace(s) ? null : s;
}
