using MessageBoard.API.Data;
using MessageBoard.API.DTOs;
using MessageBoard.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MessageBoard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly MessageBoardContext _context;
        private readonly ILogger<MessagesController> _logger;

        public MessagesController(MessageBoardContext context, ILogger<MessagesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/messages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessages([FromQuery] int? threadId = null)
        {
            try
            {
                _logger.LogInformation("Getting messages, threadId: {ThreadId}", threadId);

                IQueryable<Message> query = _context.Messages
                    .Include(m => m.User)           // Include user data
                    .Include(m => m.Thread);        // Include thread data
                    // .OrderByDescending(m => m.CreatedAt);  // Newest first

                if (threadId.HasValue)
                {
                    query = query.Where(m => m.ThreadId == threadId.Value);
                }

                var messages = await query.ToListAsync();
                
                _logger.LogInformation("Retrieved {Count} messages", messages.Count);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving messages");
                return StatusCode(500, "An error occurred while retrieving messages");
            }
        }

        // GET: api/messages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Message>> GetMessage(int id)
        {
            try
            {
                var message = await _context.Messages
                    .Include(m => m.User)
                    .Include(m => m.Thread)
                    .FirstOrDefaultAsync(m => m.Id == id);

                if (message == null)
                {
                    return NotFound();
                }

                return Ok(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving message {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the message");
            }
        }

        // POST: api/messages
        [HttpPost]
        [Authorize] // This requires a valid JWT token
        public async Task<ActionResult<Message>> PostMessage(CreateMessageRequest request)
        {
            try
            {
                // Extract user ID from JWT token claims
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("Invalid token");
                }

                // Validate the thread exists
                var thread = await _context.Threads.FindAsync(request.ThreadId);
                if (thread == null)
                {
                    return BadRequest("Thread not found");
                }

                // No need to validate user exists - they're authenticated!
                // But we can still check if we want to be extra safe
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return Unauthorized("User not found");
                }

                var message = new Message
                {
                    Content = request.Content,
                    ThreadId = request.ThreadId,
                    UserId = userId, // From JWT token, not request body
                    CreatedAt = DateTime.UtcNow
                };

                _context.Messages.Add(message);
                await _context.SaveChangesAsync();

                // Reload with includes for response
                var createdMessage = await _context.Messages
                    .Include(m => m.User)
                    .Include(m => m.Thread)
                    .FirstOrDefaultAsync(m => m.Id == message.Id);

                _logger.LogInformation("Created message {Id} by user {UserId}", message.Id, message.UserId);
                return CreatedAtAction(nameof(GetMessage), new { id = message.Id }, createdMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating message");
                return StatusCode(500, "An error occurred while creating the message");
            }
        }

        // DELETE: api/messages/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            try
            {
                var message = await _context.Messages.FindAsync(id);
                if (message == null)
                {
                    return NotFound();
                }

                _context.Messages.Remove(message);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted message {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting message {Id}", id);
                return StatusCode(500, "An error occurred while deleting the message");
            }
        }
    }
}