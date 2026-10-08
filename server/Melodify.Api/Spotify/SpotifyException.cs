namespace Melodify.Api.Spotify;

/// <summary>An error answered by Spotify, passed on to the client with a readable message.</summary>
public sealed class SpotifyException(int status, string message, int? retryAfterSeconds = null) : Exception(message)
{
    public int Status { get; } = status;
    public int? RetryAfterSeconds { get; } = retryAfterSeconds;
}

public sealed class AppException(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}
