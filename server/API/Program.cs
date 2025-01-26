using System.Text;
using System.Text.Json.Serialization;
using Core.Entities;
using Infrastructure.Data;
using Infrastructure.IServices;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using DotNetEnv; // For loading .env

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
DotNetEnv.Env.Load();

// Adjust Logging Configuration
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddFilter("Microsoft.AspNetCore", LogLevel.Warning);

// Resolve environment variables for logging
var logLevelDefault = Environment.GetEnvironmentVariable("LOG_LEVEL_DEFAULT") ?? "Information";
var logLevelMicrosoftAspNetCore = Environment.GetEnvironmentVariable("LOG_LEVEL_MICROSOFT_ASPNETCORE") ?? "Warning";

var spotifyClientId = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_ID");
var spotifyClientSecret = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_SECRET");
var spotifyRedirectUri = Environment.GetEnvironmentVariable("SPOTIFY_REDIRECT_URI");

Console.WriteLine($"Spotify Client ID: {spotifyClientId}");
Console.WriteLine($"Spotify Client Secret: {spotifyClientSecret}");
Console.WriteLine($"Spotify Redirect URI: {spotifyRedirectUri}");

// Configure logging levels dynamically
builder.Logging.AddFilter("Default", Enum.Parse<LogLevel>(logLevelDefault, true));
builder.Logging.AddFilter("Microsoft.AspNetCore", Enum.Parse<LogLevel>(logLevelMicrosoftAspNetCore, true));

// Set up CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policyBuilder => policyBuilder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// Configure DbContext with connection string from .env
var defaultConnection = Environment.GetEnvironmentVariable("DEFAULT_CONNECTION");
if (string.IsNullOrEmpty(defaultConnection))
{
    throw new InvalidOperationException("Connection string not found in environment variables.");
}

builder.Services.AddDbContext<StoreContext>(opt =>
{
    opt.UseSqlServer(defaultConnection);
});

// Configure Identity
builder.Services.AddIdentity<AppUser, IdentityRole>()
    .AddEntityFrameworkStores<StoreContext>()
    .AddDefaultTokenProviders();

// Add JWT Authentication
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");
var jwtSecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");

if (string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience) || string.IsNullOrEmpty(jwtSecretKey))
{
    throw new InvalidOperationException("JWT configuration values are missing in environment variables.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"], // from appsettings.json
        ValidAudience = builder.Configuration["Jwt:Audience"], // from appsettings.json
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"])) // from appsettings.json
    };
});

// Configure JSON serialization
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});

// Add application services
builder.Services.AddScoped<ISpotifyAuthService, SpotifyAuthService>();
builder.Services.AddScoped<IPlaylistService, PlaylistService>();
builder.Services.AddScoped<IUserService, UserService>();
// builder.Services.AddScoped<ISongService, SongService>();
builder.Services.AddHttpClient();

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await SeedRolesAndAdmin(app.Services);
app.Run();

// Seed roles and admin user
static async Task SeedRolesAndAdmin(IServiceProvider serviceProvider)
{
    using var scope = serviceProvider.CreateScope();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

    var roles = new[] { "Admin", "User" };
    foreach (var role in roles)
    {
        var roleExist = await roleManager.RoleExistsAsync(role);
        if (!roleExist)
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? "admin@test.com";
    var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? "Pa$$w0rd";

    var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
    if (existingAdmin == null)
    {
        var adminUser = new AppUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true,
            FirstName = "Admin",
            LastName = "User"
        };

        var result = await userManager.CreateAsync(adminUser, adminPassword);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}
