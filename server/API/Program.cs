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

// Add environment variables to the Configuration system
builder.Configuration.AddEnvironmentVariables();

// Adjust Logging Configuration
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddFilter("Microsoft.AspNetCore", LogLevel.Warning);

// Resolve environment variables for logging
var logLevelDefault = builder.Configuration["LOG_LEVEL_DEFAULT"] ?? "Information";
var logLevelMicrosoftAspNetCore = builder.Configuration["LOG_LEVEL_MICROSOFT_ASPNETCORE"] ?? "Warning";

// Read Spotify API credentials from environment variables
var spotifyClientId = builder.Configuration["SPOTIFY_CLIENT_ID"];
var spotifyClientSecret = builder.Configuration["SPOTIFY_CLIENT_SECRET"];
var spotifyRedirectUri = builder.Configuration["SPOTIFY_REDIRECT_URI"];

Console.WriteLine($"Spotify Client ID: {spotifyClientId}");
Console.WriteLine($"Spotify Redirect URI: {spotifyRedirectUri}");

// Configure logging levels dynamically
builder.Logging.AddFilter("Default", Enum.Parse<LogLevel>(logLevelDefault, true));
builder.Logging.AddFilter("Microsoft.AspNetCore", Enum.Parse<LogLevel>(logLevelMicrosoftAspNetCore, true));

// Set up CORS policy - Allow only frontend origin
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policyBuilder => policyBuilder
            .WithOrigins("http://localhost:4200") // Allow only frontend domain
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()); // If cookies or credentials are used
});

// Configure DbContext with connection string
var defaultConnection = builder.Configuration["DEFAULT_CONNECTION"];
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
var jwtIssuer = builder.Configuration["JWT_ISSUER"];
var jwtAudience = builder.Configuration["JWT_AUDIENCE"];
var jwtSecretKey = builder.Configuration["JWT_SECRET_KEY"];

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
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
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
builder.Services.AddScoped<ISearchService, SearchService>();

builder.Services.AddHttpClient();

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ensure HTTPS redirection works correctly
app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    context.Response.Headers.Remove("Content-Security-Policy");

    context.Response.Headers.Add("Content-Security-Policy",
        "default-src 'self'; " +
        "connect-src 'self' http://localhost:5041 http://localhost:4200; " +  // Allow API calls
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +  // Allow inline scripts
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "font-src 'self' data:;");

    await next();
});



// CORS should be applied before Authentication
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Pass Configuration to SeedRolesAndAdmin method
await SeedRolesAndAdmin(app.Services, builder.Configuration);
app.Run();

// Seed roles and admin user
static async Task SeedRolesAndAdmin(IServiceProvider serviceProvider, IConfiguration configuration)
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

    var adminEmail = configuration["ADMIN_EMAIL"] ?? "admin@test.com";
    var adminPassword = configuration["ADMIN_PASSWORD"] ?? "Pa$$w0rd";

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
