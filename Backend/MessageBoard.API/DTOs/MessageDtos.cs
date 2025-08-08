namespace MessageBoard.API.DTOs
{
      // Create message request
    public class CreateMessageRequest
    {
        public required string Content { get; set; }
        public int ThreadId { get; set; }
        public int UserId { get; set; }
    }
}