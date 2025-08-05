using MessageBoard.API.Data;           // ADD THIS
using Microsoft.EntityFrameworkCore;   // ADD THIS

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// ADD CONTROLLERS (you'll need these)
builder.Services.AddControllers();

// ADD ENTITY FRAMEWORK
builder.Services.AddDbContext<MessageBoardContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));
    
// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentCors", policy =>
    {
        policy.WithOrigins("http://localhost:3000")  // Your frontend URL
              .AllowAnyMethod()                       // GET, POST, PUT, DELETE, etc.
              .AllowAnyHeader()                       // Any request headers
              .AllowCredentials();                    // Allow cookies/auth headers
    });

    // options.AddPolicy("ProductionCors", policy =>
    // {
    //     policy.WithOrigins("https://yourdomain.com", "https://www.yourdomain.com")
    //           .WithMethods("GET", "POST", "PUT", "DELETE")
    //           .WithHeaders("Content-Type", "Authorization")
    //           .AllowCredentials();
    // });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("DevelopmentCors");  // Use CORS in development
}

app.UseHttpsRedirection();

// ADD THESE FOR CONTROLLERS
app.UseAuthorization();
app.MapControllers();

// REMOVE OR KEEP the weather forecast for now (your choice)
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