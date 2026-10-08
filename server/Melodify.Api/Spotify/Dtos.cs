namespace Melodify.Api.Spotify;

public sealed record ArtistRef(string Id, string Name);
public sealed record AlbumRef(string Id, string Name, string? Image, string? ReleaseDate);
public sealed record TrackDto(
    string Id, string Uri, string Name, ArtistRef[] Artists, AlbumRef? Album, int DurationMs, bool Explicit,
    int? Popularity, string? PreviewUrl, string? AddedAt = null, string? PlayedAt = null, bool IsLocal = false);
public sealed record ArtistDto(string Id, string Uri, string Name, string? Image, string[] Genres, int? Followers, int? Popularity);
public sealed record AlbumDto(
    string Id, string Uri, string Name, string AlbumType, string? Image, string? ReleaseDate, int TotalTracks,
    ArtistRef[] Artists, TrackDto[]? Tracks = null, string? Label = null);
public sealed record OwnerDto(string Id, string? Name);
public sealed record PlaylistDto(
    string Id, string Uri, string Name, string? Description, string? Image, OwnerDto Owner, int TrackCount,
    bool Public, bool Collaborative, string? SnapshotId, bool IsOwn);
public sealed record PlaylistDetailDto(PlaylistDto Playlist, TrackDto[] Tracks, int SkippedLocal);
public sealed record UserDto(string Id, string? DisplayName, string? Email, string? Image, string? Country, string? Product, int? Followers);
public sealed record DeviceDto(string? Id, string Name, string Type, bool IsActive, bool IsRestricted, int? VolumePercent);
public sealed record PlayerStateDto(bool IsPlaying, int ProgressMs, DeviceDto? Device, TrackDto? Track, bool Shuffle, string Repeat, string? ContextUri);
public sealed record Paged<T>(T[] Items, int Total, int Offset, int Limit);
