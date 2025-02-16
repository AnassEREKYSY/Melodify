using Moq;
using Xunit;
using API.Controllers;
using Microsoft.AspNetCore.Mvc;
using Infrastructure.IServices;
using Microsoft.AspNetCore.Http;  // Add this using directive for DefaultHttpContext
using System.Threading.Tasks;
using System.Collections.Generic;


public class UsersControllerTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly Mock<ISpotifyAuthService> _mockSpotifyAuthService;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _mockUserService = new Mock<IUserService>();
        _mockSpotifyAuthService = new Mock<ISpotifyAuthService>();
        _controller = new UsersController(_mockUserService.Object, _mockSpotifyAuthService.Object);
    }

    [Fact]
    public async Task GetFollowedArtists_ShouldReturnOk_WhenArtistsFound()
    {
        // Arrange
        var accessToken = "valid-token";
        
        // Creating a list of SpotifyFollowedArtistDetails
        var followedArtists = new List<SpotifyFollowedArtistDetails>
        {
            new SpotifyFollowedArtistDetails
            {
                Id = "artist1",
                Name = "Artist 1",
                Images = new List<SpotifyFollowedArtistImage>
                {
                    new SpotifyFollowedArtistImage { Url = "https://image1.com", Height = 300, Width = 300 }
                },
                Type = "artist",
                Followers = new SpotifyFollowers { Total = 1000 },
                Genre = new List<string> { "Rock", "Pop" },
                Popularity = 85,
                ImageUrl = "https://image1.com"
            },
            new SpotifyFollowedArtistDetails
            {
                Id = "artist2",
                Name = "Artist 2",
                Images = new List<SpotifyFollowedArtistImage>
                {
                    new SpotifyFollowedArtistImage { Url = "https://image2.com", Height = 200, Width = 200 }
                },
                Type = "artist",
                Followers = new SpotifyFollowers { Total = 2000 },
                Genre = new List<string> { "Jazz", "Blues" },
                Popularity = 90,
                ImageUrl = "https://image2.com"
            }
        };

        // Mocking the GetFollowedArtistsAsync method
        _mockUserService.Setup(s => s.GetFollowedArtistsAsync(It.IsAny<string>()))
            .ReturnsAsync(followedArtists);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
        _controller.Request.Headers.Authorization = new Microsoft.Extensions.Primitives.StringValues($"Bearer {accessToken}");

        // Act
        var result = await _controller.GetFollowedArtists();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnValue = Assert.IsType<List<SpotifyFollowedArtistDetails>>(okResult.Value);
        Assert.Equal(followedArtists.Count, returnValue.Count);
        Assert.Equal(followedArtists[0].Name, returnValue[0].Name);
    }
}
