using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using MyWebApp.Models;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

// Add detailed logging
var builder = WebApplication.CreateBuilder(args);

// Add detailed logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Debug);

var startupLogger = builder.Services.BuildServiceProvider().GetRequiredService<ILogger<Program>>();
startupLogger.LogInformation("Starting application configuration...");

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not found")))
        };
    });

// Add logging
builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.AddDebug();
    logging.SetMinimumLevel(LogLevel.Information);
});

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString),
        mySqlOptions =>
        {
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }
    );
    options.EnableSensitiveDataLogging();
    options.EnableDetailedErrors();
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("Content-Disposition");
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.WriteIndented = true;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage);
            return new BadRequestObjectResult(new { errors });
        };
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add HttpClient services
builder.Services.AddHttpClient();

// Configure port for Azure
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://*:{port}");
startupLogger.LogInformation($"Configured to listen on port: {port}");

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "The Local Finder API V1");
    c.RoutePrefix = "swagger";
});

// Add request logging middleware
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    logger.LogInformation($"Request {context.Request.Method} {context.Request.Path}");
    await next();
});

// Configure CORS
app.UseCors("AllowAll");

// Configure routing and endpoints
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Database initialization
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var dbLogger = services.GetRequiredService<ILogger<Program>>();

        dbLogger.LogInformation("Attempting to connect to database...");
        try
        {
            if (await context.Database.CanConnectAsync())
            {
                dbLogger.LogInformation("Database connection successful");
                
                // Apply migrations
                dbLogger.LogInformation("Applying database migrations...");
                await context.Database.MigrateAsync();
                dbLogger.LogInformation("Database migrations applied successfully");

                // Seed data
                dbLogger.LogInformation("Seeding database...");
                await DbSeeder.SeedBrandsAsync(context);
                await DbSeeder.SeedCategoriesAsync(context);
                await DbSeeder.SeedProductsAsync(context);
                dbLogger.LogInformation("Database seeding completed");
                
                // Check if data exists
                var hasBrands = await context.Brands.AnyAsync();
                var hasCategories = await context.Categories.AnyAsync();
                var hasProducts = await context.Products.AnyAsync();
                
                dbLogger.LogInformation($"Database contains: Brands={hasBrands}, Categories={hasCategories}, Products={hasProducts}");
            }
        }
        catch (Exception dbEx)
        {
            dbLogger.LogError(dbEx, "Database connection failed with error: {Message}", dbEx.Message);
            // Don't throw here - let the application start even if DB is not available
        }
    }
    catch (Exception ex)
    {
        var errorLogger = services.GetRequiredService<ILogger<Program>>();
        errorLogger.LogError(ex, "An error occurred while initializing the database: {Message}", ex.Message);
        // Don't throw here - let the application start even if DB is not available
    }
}

app.Run();
