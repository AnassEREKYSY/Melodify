namespace Infrastructure.Response
{
    public class SpotifyUserProfileResponse
    {
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public List<Image> Images { get; set; }
    }

    public class Image
    {
        public string Url { get; set; }
    }
}