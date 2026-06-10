using Microsoft.EntityFrameworkCore;
using GcmsSoc.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Register controllers
builder.Services.AddControllers();

// Register SignalR services
builder.Services.AddSignalR();

// Register AppDbContext with MS SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// Add CORS Policy for React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactAppPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // Allow any origin dynamically
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Enable CORS
app.UseCors("ReactAppPolicy");

// In development/production, handle redirection or let nginx/docker proxy handle it
// We can comment it or keep it simple. If running in container without SSL, keep UseHttpsRedirection disabled or optional
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHub<GcmsSoc.API.Hubs.ChatHub>("/hub/chat");

// Health check endpoint
app.MapGet("/api/portal/health", () => Results.Ok(new { status = "healthy", database = "MSSQLServer", server = "ASP.NET Core 10" }));

// Initialize/Seed Database on application startup with retry for Docker SQL Server start
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var context = services.GetRequiredService<AppDbContext>();
    
    int retries = 5;
    while (retries > 0)
    {
        try
        {
            logger.LogInformation("Attempting to connect and initialize database (Retries left: {Retries})...", retries);
            DbInitializer.Initialize(context);
            logger.LogInformation("Database initialized and seeded successfully.");
            break;
        }
        catch (Exception ex)
        {
            retries--;
            logger.LogWarning(ex, "Failed to connect/seed database. Retrying in 5 seconds...");
            if (retries == 0)
            {
                logger.LogError(ex, "An error occurred while seeding the database after multiple attempts.");
            }
            else
            {
                System.Threading.Thread.Sleep(5000);
            }
        }
    }
}

app.Run();
