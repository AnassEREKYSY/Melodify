using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;

namespace Infrastructure.Middleware
{
    public class SpotifyAuthMiddleware(RequestDelegate _next, HttpClient _httpClient)
    {
        public async Task Invoke(HttpContext context)
        {
            var authorizationHeader = context.Request.Headers.Authorization.FirstOrDefault();

            if (string.IsNullOrEmpty(authorizationHeader) || !AuthenticationHeaderValue.TryParse(authorizationHeader, out var authHeader))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Missing or invalid Authorization header.");
                return;
            }

            if (authHeader.Scheme != "Bearer" || string.IsNullOrEmpty(authHeader.Parameter))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Invalid token format.");
                return;
            }

            var token = authHeader.Parameter;

            var isValid = await ValidateSpotifyToken(token);
            if (!isValid)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Invalid or expired Spotify token.");
                return;
            }

            await _next(context);
        }

        private async Task<bool> ValidateSpotifyToken(string token)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://api.spotify.com/v1/me");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
    }
}