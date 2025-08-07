using MessageBoard.API.Models;
using Microsoft.EntityFrameworkCore;

namespace MessageBoard.API.Data
{
    public static class SeedData
    {
        public static async Task Initialize(MessageBoardContext context)
        {
            // Check if data already exists
            if (await context.Users.AnyAsync())
            {
                return; // Data already seeded
            }

            // Create sample users
            var users = new[]
            {
                new User
                {
                    Username = "admin",
                    Email = "admin@messageboard.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                },
                new User
                {
                    Username = "john_doe",
                    Email = "john@example.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-20)
                },
                new User
                {
                    Username = "jane_smith",
                    Email = "jane@example.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-15)
                }
            };

            context.Users.AddRange(users);
            await context.SaveChangesAsync();

            // Create sample threads
            var threads = new[]
            {
                new Models.Thread
                {
                    Title = "Welcome to the Message Board!",
                    UserId = users[0].Id, // admin
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Models.Thread
                {
                    Title = "General Discussion",
                    UserId = users[1].Id, // john_doe
                    CreatedAt = DateTime.UtcNow.AddDays(-8)
                },
                new Models.Thread
                {
                    Title = "Feature Requests",
                    UserId = users[2].Id, // jane_smith
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                }
            };

            context.Threads.AddRange(threads);
            await context.SaveChangesAsync();

            // Create sample messages
            var messages = new[]
            {
                new Message
                {
                    Content = "Welcome everyone! This is our new message board. Feel free to discuss anything here.",
                    ThreadId = threads[0].Id,
                    UserId = users[0].Id, // admin
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Message
                {
                    Content = "Thanks for setting this up! Looking forward to great discussions.",
                    ThreadId = threads[0].Id,
                    UserId = users[1].Id, // john_doe
                    CreatedAt = DateTime.UtcNow.AddDays(-9)
                },
                new Message
                {
                    Content = "This is awesome! The interface looks really clean.",
                    ThreadId = threads[0].Id,
                    UserId = users[2].Id, // jane_smith
                    CreatedAt = DateTime.UtcNow.AddDays(-9)
                },
                new Message
                {
                    Content = "Hey everyone! What's your favorite programming language and why?",
                    ThreadId = threads[1].Id,
                    UserId = users[1].Id, // john_doe
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                },
                new Message
                {
                    Content = "I love TypeScript! It brings type safety to JavaScript without losing flexibility.",
                    ThreadId = threads[1].Id,
                    UserId = users[2].Id, // jane_smith
                    CreatedAt = DateTime.UtcNow.AddDays(-6)
                },
                new Message
                {
                    Content = "C# is my go-to! The .NET ecosystem is fantastic for building robust applications.",
                    ThreadId = threads[1].Id,
                    UserId = users[0].Id, // admin
                    CreatedAt = DateTime.UtcNow.AddDays(-6)
                },
                new Message
                {
                    Content = "It would be great to have real-time notifications when someone replies to your messages.",
                    ThreadId = threads[2].Id,
                    UserId = users[2].Id, // jane_smith
                    CreatedAt = DateTime.UtcNow.AddDays(-4)
                },
                new Message
                {
                    Content = "Great idea! We could implement that with SignalR for real-time updates.",
                    ThreadId = threads[2].Id,
                    UserId = users[0].Id, // admin
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                }
            };

            context.Messages.AddRange(messages);
            await context.SaveChangesAsync();

            Console.WriteLine("Sample data created successfully!");
        }
    }
}