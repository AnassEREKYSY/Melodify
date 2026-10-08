using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Melodify.Tests;

/// <summary>Request rules that do not need Spotify (it is never called in these tests).</summary>
public class ApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Health_is_public()
    {
        var res = await factory.CreateClient().GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Theory]
    [InlineData("/api/me")]
    [InlineData("/api/playlists")]
    [InlineData("/api/player")]
    public async Task Private_routes_need_a_token(string url)
    {
        var res = await factory.CreateClient().GetAsync(url);
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
        var body = await res.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        Assert.Equal("Sign in with Spotify first.", body!["error"]);
    }

    [Fact]
    public async Task Ids_are_validated_before_calling_spotify()
    {
        var c = factory.CreateClient();
        c.DefaultRequestHeaders.Authorization = new("Bearer", "a-long-enough-test-token");
        var res = await c.GetAsync("/api/artists/not.an.id");
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Unknown_api_routes_are_404_json_not_the_app()
    {
        var res = await factory.CreateClient().GetAsync("/api/nope");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }
}
