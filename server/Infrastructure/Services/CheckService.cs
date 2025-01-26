using Core.Entities;
using Infrastructure.Data;
using Infrastructure.IServices;
using Infrastructure.Response;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class CheckService 
    {
        private readonly HttpClient _httpClient;
        private readonly ISpotifyAuthService _spotifyAuthService;
        private readonly StoreContext _context;

        public CheckService(HttpClient httpClient, ISpotifyAuthService spotifyAuthService, StoreContext context)
        {
            _httpClient = httpClient;
            _spotifyAuthService = spotifyAuthService;
            _context = context;
        }

        public static void  CheckPlaylistsInseredForUser(string userId)
        {

        }

    }
}