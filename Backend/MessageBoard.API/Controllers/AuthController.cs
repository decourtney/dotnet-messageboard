using MessageBoard.API.Data;
using MessageBoard.API.DTOs;
using MessageBoard.API.Models;
using MessageBoard.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace MessageBoard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MessageBoardContext _context;
        private readonly IJwtService _jwtService;

        // Constructor injection - .NET DI provides these services
        public AuthController(MessageBoardContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            try
            {
                // Check if user already exists
                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Username already exists"
                    });
                }

                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Email already exists"
                    });
                }

                // Hash the password
                var passwordHash = HashPassword(request.Password);

                // Create new user
                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = passwordHash,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Generate JWT token
                var token = _jwtService.GenerateToken(user);

                // Return success response
                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Registration successful",
                    Token = token,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        CreatedAt = user.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred during registration"
                });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            try
            {
                // Find user by username
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == request.Username);

                if (user == null)
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Invalid username or password"
                    });
                }

                // Verify password
                if (!VerifyPassword(request.Password, user.PasswordHash))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Invalid username or password"
                    });
                }

                // Generate JWT token
                var token = _jwtService.GenerateToken(user);

                // Return success response
                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        CreatedAt = user.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred during login"
                });
            }
        }

        // Private helper methods for password hashing
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            var hashedInput = HashPassword(password);
            return hashedInput == hash;
        }
    }
}