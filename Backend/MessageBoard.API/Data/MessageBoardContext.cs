using Microsoft.EntityFrameworkCore;
using MessageBoard.API.Models;

namespace MessageBoard.API.Data
{
    public class MessageBoardContext : DbContext
    {
        public MessageBoardContext(DbContextOptions<MessageBoardContext> options) : base(options)
        {
        }

        // DbSets - be explicit about which Thread we mean
        public DbSet<User> Users { get; set; }
        public DbSet<Models.Thread> Threads { get; set; }  // ADD Models. prefix
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User -> Threads relationship
            modelBuilder.Entity<Models.Thread>()  // ADD Models. prefix
                .HasOne(t => t.User)
                .WithMany(u => u.Threads)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> Messages relationship  
            modelBuilder.Entity<Message>()
                .HasOne(m => m.User)
                .WithMany(u => u.Messages)
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Thread -> Messages relationship
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Thread)
                .WithMany(t => t.Messages)
                .HasForeignKey(m => m.ThreadId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes for performance
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}