using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Melodify.Api.Spotify;

/// <summary>Thin wrapper over the Spotify Web API. Every call uses the signed-in user's access token.</summary>
public sealed class SpotifyClient(HttpClient http, SpotifyOptions options)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task<JsonElement?> GetAsync(string token, string path, CancellationToken ct = default)
    {
        using var req = Build(HttpMethod.Get, token, path, null);
        return await SendAsync(req, ct);
    }

    public async Task<JsonElement?> SendAsync(HttpMethod method, string token, string path, object? body = null, CancellationToken ct = default)
    {
        using var req = Build(method, token, path, body);
        return await SendAsync(req, ct);
    }

    /// <summary>Follows Spotify "next" links until the end or <paramref name="max"/> items.</summary>
    public async Task<List<JsonElement>> GetAllAsync(string token, string path, int max, CancellationToken ct = default, string itemsProperty = "items")
    {
        var items = new List<JsonElement>();
        string? next = path;
        while (next is not null && items.Count < max)
        {
            var page = await GetAsync(token, next, ct);
            if (page is not { } p) break;
            var container = p.TryGetProperty(itemsProperty, out var inner) && inner.ValueKind == JsonValueKind.Object ? inner : p;
            if (container.TryGetProperty("items", out var arr) && arr.ValueKind == JsonValueKind.Array)
                foreach (var it in arr.EnumerateArray()) items.Add(it.Clone());
            next = container.TryGetProperty("next", out var n) && n.ValueKind == JsonValueKind.String ? n.GetString() : null;
        }
        return items.Count > max ? items.GetRange(0, max) : items;
    }

    private HttpRequestMessage Build(HttpMethod method, string token, string path, object? body)
    {
        var url = path.StartsWith("http", StringComparison.Ordinal) ? RewriteBase(path) : $"{options.ApiBase}/{path.TrimStart('/')}";
        var req = new HttpRequestMessage(method, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (body is not null) req.Content = new StringContent(JsonSerializer.Serialize(body, Json), Encoding.UTF8, "application/json");
        else if (method != HttpMethod.Get && method != HttpMethod.Delete) req.Content = new StringContent("", Encoding.UTF8, "application/json");
        return req;
    }

    // "next" links point to api.spotify.com; keep them on the configured base (useful with a mock).
    private string RewriteBase(string url) =>
        url.StartsWith("https://api.spotify.com/v1", StringComparison.Ordinal) ? options.ApiBase + url["https://api.spotify.com/v1".Length..] : url;

    private async Task<JsonElement?> SendAsync(HttpRequestMessage req, CancellationToken ct)
    {
        var body = req.Content is null ? null : await req.Content.ReadAsByteArrayAsync(ct);
        using var res = await SendWithRetryAsync(req, body, ct);
        var text = await res.Content.ReadAsStringAsync(ct);
        if (!res.IsSuccessStatusCode) throw ToException(res, text);
        if (string.IsNullOrWhiteSpace(text)) return null;
        try { return JsonDocument.Parse(text).RootElement.Clone(); }
        catch (JsonException) { return null; } // a few endpoints answer plain text
    }

    /// <summary>One short retry on rate limiting; longer waits go back to the caller as 429.</summary>
    private async Task<HttpResponseMessage> SendWithRetryAsync(HttpRequestMessage req, byte[]? body, CancellationToken ct)
    {
        var res = await http.SendAsync(Copy(req, body), ct);
        if (res.StatusCode != HttpStatusCode.TooManyRequests) return res;
        var wait = res.Headers.RetryAfter?.Delta ?? TimeSpan.FromSeconds(1);
        if (wait > TimeSpan.FromSeconds(3)) return res;
        res.Dispose();
        await Task.Delay(wait, ct);
        return await http.SendAsync(Copy(req, body), ct);
    }

    private static HttpRequestMessage Copy(HttpRequestMessage r, byte[]? body)
    {
        var c = new HttpRequestMessage(r.Method, r.RequestUri);
        foreach (var h in r.Headers) c.Headers.TryAddWithoutValidation(h.Key, h.Value);
        if (body is not null)
        {
            c.Content = new ByteArrayContent(body);
            c.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        }
        return c;
    }

    private static SpotifyException ToException(HttpResponseMessage res, string body)
    {
        var status = (int)res.StatusCode;
        string? message = null;
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("error", out var e))
                message = e.ValueKind == JsonValueKind.Object && e.TryGetProperty("message", out var m) ? m.GetString() : e.GetString();
        }
        catch (JsonException)
        {
            // Some refusals (e.g. a user not added to a development-mode app) come back as plain text.
            if (!string.IsNullOrWhiteSpace(body) && body.Length < 300 && !body.TrimStart().StartsWith('<')) message = body.Trim();
        }
        var friendly = status switch
        {
            401 => "Your Spotify session expired. Please sign in again.",
            403 when message?.Contains("Premium", StringComparison.OrdinalIgnoreCase) == true => "This needs Spotify Premium.",
            403 => message ?? "Spotify refused this action.",
            404 when message?.Contains("device", StringComparison.OrdinalIgnoreCase) == true => "No active device. Open Spotify on a device or pick one.",
            404 => message ?? "Not found on Spotify.",
            429 => "Spotify is rate limiting requests. Try again in a moment.",
            _ => message ?? "Spotify did not answer as expected.",
        };
        return new SpotifyException(status is >= 500 ? 502 : status, friendly, (int?)res.Headers.RetryAfter?.Delta?.TotalSeconds);
    }
}
