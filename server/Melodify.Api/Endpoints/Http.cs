using Melodify.Api.Spotify;

namespace Melodify.Api.Endpoints;

public static class Http
{
    /// <summary>The Spotify access token sent by the browser (Bearer). Required on every /api route except auth.</summary>
    public static string Token(this HttpContext ctx) =>
        ctx.Items["spotify_token"] as string ?? throw new AppException(401, "Sign in with Spotify first.");

    public static RouteGroupBuilder RequireSpotifyToken(this RouteGroupBuilder g) =>
        g.AddEndpointFilter(async (ic, next) =>
        {
            var h = ic.HttpContext.Request.Headers.Authorization.ToString();
            if (!h.StartsWith("Bearer ", StringComparison.Ordinal) || h.Length < 20)
                return Results.Json(new { error = "Sign in with Spotify first." }, statusCode: 401);
            ic.HttpContext.Items["spotify_token"] = h[7..].Trim();
            return await next(ic);
        });

    public static int Clamp(int? v, int min, int max, int fallback) => v is null ? fallback : Math.Clamp(v.Value, min, max);

    public static string TimeRange(string? range) => range switch
    {
        "short" or "short_term" => "short_term",
        "long" or "long_term" => "long_term",
        _ => "medium_term",
    };

    public static void ValidateId(string id, string what = "id")
    {
        if (string.IsNullOrWhiteSpace(id) || id.Length > 64 || !id.All(c => char.IsLetterOrDigit(c)))
            throw new AppException(400, $"Invalid {what}.");
    }
}
