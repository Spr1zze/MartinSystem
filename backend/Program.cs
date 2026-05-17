using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Services;
using Backend.Controllers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Use absolute path for database
var dbPath = Path.Combine(AppContext.BaseDirectory, "inventory.db");
var connectionString = $"Data Source={dbPath}";

builder.Services.AddDbContext<AppDbContext>(
    options => options.UseSqlite(connectionString)
);

builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<InventoryItemService>();
builder.Services.AddScoped<InventoryLogService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<WorkLogService>();
builder.Services.AddScoped<SupplyListService>();
builder.Services.AddControllers();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
}

// Configure the HTTP request pipeline.
app.UseCors("AllowFrontend");
// app.UseHttpsRedirection();
app.MapControllers();

app.MapGet("/health", () => "OK");

app.Run();
