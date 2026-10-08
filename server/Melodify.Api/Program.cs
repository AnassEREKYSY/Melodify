using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Diagnostics;
using Melodify.Api.Endpoints;
using Melodify.Api.Spotify;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(o => o.ListenAnyIP(int.TryParse(builder.Configuration["PORT"], out var p) ? p : 5001));

var spotify = SpotifyOptions.FromEnvironment(builder.Configuration);
if (builder.Environment.IsProduction() && (spotify.ClientId == "" || spotify.ClientSecret == "" || spotify.RedirectUri == ""))
    throw new InvalidOperationException("SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REDIRECT_URI are required.");

builder.Services.AddSingleton(spotify);
builder.Services.AddHttpClient<SpotifyClient>(c => c.Timeout = TimeSpan.FromSeconds(15));
builder.Services.AddHttpClient("spotify-accounts", c => c.Timeout = TimeSpan.FromSeconds(15));
builder.Services.AddMemoryCache();
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never;
});
// Local development only: the SPA runs on another port. In production the API serves the SPA itself.
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins(
    (builder.Configuration["CORS_ORIGINS"] ?? "http://localhost:4200").Split(',', StringSplitOptions.RemoveEmptyEntries)).AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseExceptionHandler(e => e.Run(async ctx =>
{
    var ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
    (int status, string message) = ex switch
    {
        SpotifyException s => (s.Status, s.Message),
        AppException a => (a.Status, a.Message),
        BadHttpRequestException => (400, "Invalid request."),
        TaskCanceledException => (504, "Spotify took too long to answer."),
        HttpRequestException => (502, "Could not reach Spotify."),
        _ => (500, "Something went wrong."),
    };
    if (status >= 500) app.Logger.LogError(ex, "Request failed");
    if (ex is SpotifyException { RetryAfterSeconds: { } ra }) ctx.Response.Headers.RetryAfter = ra.ToString();
    ctx.Response.StatusCode = status;
    await ctx.Response.WriteAsJsonAsync(new { error = message });
}));

app.UseCors();
app.UseDefaultFiles();
// Hashed bundles (main-ABC123.js) are immutable; everything else, index.html included, is revalidated.
var staticFiles = new StaticFileOptions
{
    OnPrepareResponse = c => c.Context.Response.Headers.CacheControl =
        System.Text.RegularExpressions.Regex.IsMatch(c.File.Name, @"-[A-Z0-9]{8,}\.(js|css)$") ? "public,max-age=31536000,immutable" : "no-cache",
};
app.UseStaticFiles(staticFiles);

app.MapGet("/api/health", () => Results.Ok(new { ok = true }));

var api = app.MapGroup("/api");
api.MapAuth();

var secured = api.MapGroup("").RequireSpotifyToken();
secured.MapMe();
secured.MapPlaylists();
secured.MapCatalog();
secured.MapPlayer();

app.MapFallback("/api/{**rest}", () => Results.Json(new { error = "Not found" }, statusCode: 404));
app.MapFallbackToFile("index.html", staticFiles);

app.Run();

public partial class Program;
