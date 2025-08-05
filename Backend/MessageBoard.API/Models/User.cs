using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MessageBoard.API.Models
{
    [Table("Users")]  // Explicit table name
    public class User
    {
        [Key]  // Explicit primary key
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]  // Auto-increment
        public int Id { get; set; }
        
        [Required]  // NOT NULL
        [MaxLength(50)]  // VARCHAR(50)
        [Column("username")]  // Explicit column name
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        [EmailAddress]  // Built-in email validation
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]  // For hashed passwords
        public string PasswordHash { get; set; } = string.Empty;
        
        [Column("created_at")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]  // Set by database
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties - these DON'T become columns
        [InverseProperty("User")]  // Points to User property in Thread
        public ICollection<Thread> Threads { get; set; } = new List<Thread>();
        
        [InverseProperty("User")]  // Points to User property in Message
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}