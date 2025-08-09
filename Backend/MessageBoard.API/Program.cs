using MessageBoard.API.Data;
using MessageBoard.API.Configuration;
using MessageBoard.API.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Configure JWT Settings - Bind configuration to strongly-typed object
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("JwtSettings"));

// Register JWT Service for Dependency Injection
builder.Services.AddScoped<IJwtService, JwtService>();

// Configure JSON options to handle circular references
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Add Entity Framework
builder.Services.AddDbContext<MessageBoardContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));

// Add Authentication Services
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings?.Issuer,
        ValidAudience = jwtSettings?.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings?.SecretKey ?? "")),
        ClockSkew = TimeSpan.Zero
    };
});

// Add Authorization Services
builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentCors", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Seed data in development
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<MessageBoardContext>();
        await SeedData.Initialize(context);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("DevelopmentCors");
}

// IMPORTANT: Middleware order matters in .NET!
// 1. CORS (if needed)
// 2. Authentication (who are you?)
app.UseAuthentication();
// 3. Authorization (what can you do?)
app.UseAuthorization();

// 4. Controllers
app.MapControllers();

// Keep weather forecast for testing
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}