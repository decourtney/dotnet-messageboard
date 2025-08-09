using MessageBoard.API.Models;

namespace MessageBoard.API.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        bool ValidateToken(string token);
    }
}