using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MessageBoard.API.Models
{
    [Table("Messages")]
    public class Message
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(5000)]  // Long text for message content
        public string Content { get; set; } = string.Empty;
        
        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }
        
        [Required]
        [ForeignKey("Thread")]
        public int ThreadId { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }  // Nullable for optional updates
        
        // Navigation properties
        [Required]
        public User User { get; set; } = null!;
        
        [Required]
        public Thread Thread { get; set; } = null!;
    }
}