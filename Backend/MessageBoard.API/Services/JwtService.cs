using MessageBoard.API.Configuration;
using MessageBoard.API.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MessageBoard.API.Services
{
    public class JwtService : IJwtService
    {
        private readonly JwtSettings _jwtSettings;

        // Constructor injection - .NET DI will provide the JwtSettings
        public JwtService(IOptions<JwtSettings> jwtSettings)
        {
            _jwtSettings = jwtSettings.Value;
        }

        public string GenerateToken(User user)
        {
            // Create claims - this is user info stored IN the token
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), // Subject (user ID)
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // JWT ID
                new Claim(JwtRegisteredClaimNames.Iat, 
                    new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), 
                    ClaimValueTypes.Integer64) // Issued at
            };

            // Create signing key from secret
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Create the token
            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryInMinutes),
                signingCredentials: credentials
            );

            // Return the serialized token
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public bool ValidateToken(string token)
        {
            try
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
                
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidAudience = _jwtSettings.Audience,
                    IssuerSigningKey = key,
                    ClockSkew = TimeSpan.Zero // No tolerance for expiry
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}