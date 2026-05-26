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
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var userDataPath = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
    "martin-inventory"
);
Directory.CreateDirectory(userDataPath);

var dbPath = Path.Combine(userDataPath, "inventory.db");
Console.WriteLine($"Database path: {dbPath}");

var connectionString = $"Data Source={dbPath}";

builder.Services.AddDbContext<AppDbContext>(
    options => options.UseSqlite(connectionString)
);


// bad bad bad code 
// var dbPath = Environment.GetEnvironmentVariable("INVENTORY_DB_PATH");

// if (string.IsNullOrEmpty(dbPath))
// {
//     // Default to local development database
//     dbPath = Path.Combine(AppContext.BaseDirectory, "inventory.db");
// }

// var connectionString = $"Data Source={dbPath}";

// builder.Services.AddDbContext<AppDbContext>(
//     options => options.UseSqlite(connectionString)
// );


builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<InventoryItemService>();
builder.Services.AddScoped<InventoryLogService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<WorkLogService>();
builder.Services.AddScoped<ExtraListService>();
builder.Services.AddScoped<DbBackupService>();
builder.Services.AddControllers();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    Console.WriteLine("Creating Database...");
    await dbContext.Database.EnsureCreatedAsync();
    Console.WriteLine("Database succesfully created.");

    try
    {
        var tableCount = dbContext.InventoryItems.Count();
        Console.WriteLine($"Inventory items in database: {tableCount}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error checking tables: {ex.Message}");
    }

    var backupService = scope.ServiceProvider.GetRequiredService<DbBackupService>();
    backupService.CopyDbFile();
}

// Configure the HTTP request pipeline.
app.UseCors("AllowFrontend");
// app.UseHttpsRedirection();
app.MapControllers();

app.MapGet("/health", () => "OK");

app.Run();
