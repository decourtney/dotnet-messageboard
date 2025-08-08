using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MessageBoard.API.Data;
using MessageBoard.API.Models;
using MessageBoard.API.DTOs;

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
                    .Include(m => m.Thread)         // Include thread data
                    .OrderByDescending(m => m.CreatedAt);  // Newest first

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
        public async Task<ActionResult<Message>> PostMessage(CreateMessageRequest request)
        {
            try
            {
                // Validate the thread exists
                var thread = await _context.Threads.FindAsync(request.ThreadId);
                if (thread == null)
                {
                    return BadRequest("Thread not found");
                }

                // Validate the user exists
                var user = await _context.Users.FindAsync(request.UserId);
                if (user == null)
                {
                    return BadRequest("User not found");
                }

                var message = new Message
                {
                    Content = request.Content,
                    ThreadId = request.ThreadId,
                    UserId = request.UserId,
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