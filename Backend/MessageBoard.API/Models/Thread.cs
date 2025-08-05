using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MessageBoard.API.Models
{
    [Table("Threads")]
    public class Thread
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [ForeignKey("User")]  // Explicit foreign key reference
        public int UserId { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [Required]  // User must exist
        public User User { get; set; } = null!;
        
        [InverseProperty("Thread")]  // Points to Thread property in Message
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}