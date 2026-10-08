namespace Melodify.Api.Spotify;

public sealed class SpotifyOptions
{
    public string ClientId { get; init; } = "";
    public string ClientSecret { get; init; } = "";
    /// <summary>Must match the redirect URI registered in the Spotify dashboard.</summary>
    public string RedirectUri { get; init; } = "";
    /// <summary>Where the browser lands after Spotify sends the user back.</summary>
    public string FrontendUrl { get; init; } = "https://melodify.anasserekysy.com";
    /// <summary>Overridable for local testing against a mock.</summary>
    public string ApiBase { get; init; } = "https://api.spotify.com/v1";
    public string AccountsBase { get; init; } = "https://accounts.spotify.com";

    public static readonly string[] Scopes =
    [
        "user-read-private", "user-read-email",
        "playlist-read-private", "playlist-read-collaborative", "playlist-modify-public", "playlist-modify-private",
        "user-library-read", "user-library-modify",
        "user-follow-read", "user-follow-modify",
        "user-top-read", "user-read-recently-played",
        "user-read-playback-state", "user-modify-playback-state", "user-read-currently-playing",
        "streaming",
    ];

    public static SpotifyOptions FromEnvironment(IConfiguration c) => new()
    {
        ClientId = c["SPOTIFY_CLIENT_ID"] ?? "",
        ClientSecret = c["SPOTIFY_CLIENT_SECRET"] ?? "",
        RedirectUri = c["SPOTIFY_REDIRECT_URI"] ?? "",
        FrontendUrl = (c["FRONTEND_URL"] ?? "https://melodify.anasserekysy.com").TrimEnd('/'),
        ApiBase = (c["SPOTIFY_API_BASE"] ?? "https://api.spotify.com/v1").TrimEnd('/'),
        AccountsBase = (c["SPOTIFY_ACCOUNTS_BASE"] ?? "https://accounts.spotify.com").TrimEnd('/'),
    };
}
