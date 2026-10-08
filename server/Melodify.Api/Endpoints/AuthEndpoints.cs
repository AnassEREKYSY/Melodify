using System.Security.Cryptography;
using System.Text.Json;
using Melodify.Api.Spotify;

namespace Melodify.Api.Endpoints;

/// <summary>Spotify OAuth (authorization code). The client secret never leaves the server.</summary>
public static class AuthEndpoints
{
    public static void MapAuth(this RouteGroupBuilder api)
    {
        var g = api.MapGroup("/spotify-auth");

        g.MapGet("/get-url-login", (SpotifyOptions o) =>
        {
            var state = Convert.ToHexString(RandomNumberGenerator.GetBytes(12)).ToLowerInvariant();
            var url = $"{o.AccountsBase}/authorize?client_id={o.ClientId}&response_type=code" +
                      $"&redirect_uri={Uri.EscapeDataString(o.RedirectUri)}&scope={Uri.EscapeDataString(string.Join(' ', SpotifyOptions.Scopes))}" +
                      $"&state={state}&show_dialog=true";
            return Results.Ok(new { url, state });
        });

        // Spotify redirects here (registered redirect URI); hand the code to the front end.
        g.MapGet("/callback", (string? code, string? state, string? error, SpotifyOptions o) =>
            Results.Redirect(error is not null
                ? $"{o.FrontendUrl}/login?error={Uri.EscapeDataString(error)}"
                : $"{o.FrontendUrl}/login?code={Uri.EscapeDataString(code ?? "")}&state={Uri.EscapeDataString(state ?? "")}"));

        g.MapGet("/exchange", async (string code, SpotifyOptions o, IHttpClientFactory f, SpotifyClient spotify, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(code)) throw new AppException(400, "Missing code.");
            var token = await TokenRequest(f, o, new() { ["grant_type"] = "authorization_code", ["code"] = code, ["redirect_uri"] = o.RedirectUri }, ct);
            System.Text.Json.JsonElement? me;
            try { me = await spotify.GetAsync(token.AccessToken, "me", ct); }
            catch (SpotifyException e) when (e.Status == 403)
            {
                // Development-mode apps: the owner needs Premium and every user must be added in the dashboard.
                throw new AppException(403, "Spotify blocked this account for Melodify. The account must be added under \"Users and access\" in the Spotify developer dashboard, and the app owner needs Spotify Premium.");
            }
            return Results.Ok(new { user = me is { } m ? Map.User(m) : null, token.AccessToken, token.ExpiresIn, token.RefreshToken });
        });

        g.MapPost("/refresh", async (RefreshBody body, SpotifyOptions o, IHttpClientFactory f, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(body.RefreshToken)) throw new AppException(400, "Missing refresh token.");
            var t = await TokenRequest(f, o, new() { ["grant_type"] = "refresh_token", ["refresh_token"] = body.RefreshToken }, ct);
            // Spotify may or may not rotate the refresh token.
            return Results.Ok(new { t.AccessToken, t.ExpiresIn, RefreshToken = t.RefreshToken ?? body.RefreshToken });
        });
    }

    public sealed record RefreshBody(string RefreshToken);
    sealed record TokenResult(string AccessToken, int ExpiresIn, string? RefreshToken);

    static async Task<TokenResult> TokenRequest(IHttpClientFactory f, SpotifyOptions o, Dictionary<string, string> form, CancellationToken ct)
    {
        form["client_id"] = o.ClientId;
        form["client_secret"] = o.ClientSecret;
        using var res = await f.CreateClient("spotify-accounts").PostAsync($"{o.AccountsBase}/api/token", new FormUrlEncodedContent(form), ct);
        var text = await res.Content.ReadAsStringAsync(ct);
        if (!res.IsSuccessStatusCode)
            throw new AppException(res.StatusCode == System.Net.HttpStatusCode.BadRequest ? 401 : 502, "Spotify sign-in failed. Please try again.");
        using var doc = JsonDocument.Parse(text);
        var r = doc.RootElement;
        return new TokenResult(
            r.GetProperty("access_token").GetString()!,
            r.TryGetProperty("expires_in", out var e) ? e.GetInt32() : 3600,
            r.TryGetProperty("refresh_token", out var rt) ? rt.GetString() : null);
    }
}
