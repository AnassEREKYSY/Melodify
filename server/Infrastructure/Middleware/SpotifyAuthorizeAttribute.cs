using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Middleware
{
    public class SpotifyAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
    {
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var httpClient = context.HttpContext.RequestServices.GetRequiredService<HttpClient>();
            var authorizationHeader = context.HttpContext.Request.Headers["Authorization"].FirstOrDefault();

            if (string.IsNullOrEmpty(authorizationHeader) || !AuthenticationHeaderValue.TryParse(authorizationHeader, out var authHeader))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            if (authHeader.Scheme != "Bearer" || string.IsNullOrEmpty(authHeader.Parameter))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var token = authHeader.Parameter;

            var isValid = await ValidateSpotifyToken(httpClient, token);
            if (!isValid)
            {
                context.Result = new UnauthorizedResult();
            }
        }

        private static async Task<bool> ValidateSpotifyToken(HttpClient httpClient, string token)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://api.spotify.com/v1/me");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
    }
}