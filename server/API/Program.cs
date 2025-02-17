using System.Text.Json.Serialization;
using Infrastructure.IServices;
using Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Core.Entities;
using DotNetEnv;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to listen on all IPs
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5001); // Listen on all available interfaces on port 5001
});

DotNetEnv.Env.Load();
builder.Configuration.AddEnvironmentVariables();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddFilter("Microsoft.AspNetCore", LogLevel.Warning);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policyBuilder => policyBuilder
            .SetIsOriginAllowed(origin => new Uri(origin).Host == "127.0.0.1" || new Uri(origin).Host == "localhost") // ✅ Allow same-origin requests
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});

builder.Services.AddScoped<ISpotifyAuthService, SpotifyAuthService>();
builder.Services.AddScoped<IPlaylistService, PlaylistService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<IArtistService, ArtistService>();
builder.Services.AddScoped<ISongService, SongService>();

builder.Services.AddHttpClient();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// ✅ Apply CORS before anything else
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseStaticFiles(); // ✅ Serves Angular from wwwroot

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers(); // ✅ Ensure API controllers are mapped first

// ✅ Serve Angular's index.html for any unknown routes (EXCEPT API)
app.MapFallbackToFile("index.html");

app.Run();
