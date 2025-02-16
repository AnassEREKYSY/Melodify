using System.Text.Json.Serialization;
using Infrastructure.IServices;
using Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Core.Entities;
using DotNetEnv;
var builder = WebApplication.CreateBuilder(args);

DotNetEnv.Env.Load();

builder.Configuration.AddEnvironmentVariables();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddFilter("Microsoft.AspNetCore", LogLevel.Warning);

var logLevelDefault = builder.Configuration["LOG_LEVEL_DEFAULT"] ?? "Information";
var logLevelMicrosoftAspNetCore = builder.Configuration["LOG_LEVEL_MICROSOFT_ASPNETCORE"] ?? "Warning";

var spotifyClientId = builder.Configuration["SPOTIFY_CLIENT_ID"];
var spotifyClientSecret = builder.Configuration["SPOTIFY_CLIENT_SECRET"];
var spotifyRedirectUri = builder.Configuration["SPOTIFY_REDIRECT_URI"];
builder.Logging.AddFilter("Default", Enum.Parse<LogLevel>(logLevelDefault, true));
builder.Logging.AddFilter("Microsoft.AspNetCore", Enum.Parse<LogLevel>(logLevelMicrosoftAspNetCore, true));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policyBuilder => policyBuilder
            .WithOrigins(
                "http://localhost:4200", 
                "http://client",
                "http://client:80"
            ) 
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

//app.Urls.Add("http://*:5000");

app.Use(async (context, next) =>
{
    context.Response.Headers.Remove("Content-Security-Policy");

    context.Response.Headers.Add("Content-Security-Policy",
        "default-src 'self'; " +
        "connect-src 'self' http://localhost:5041 http://localhost:4200 http://server:5000; " + 
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "font-src 'self' data:;");

    await next();
});

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
