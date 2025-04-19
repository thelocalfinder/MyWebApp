using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Models;
using MyWebApp.Data;
using Microsoft.Extensions.Logging;
using System;

namespace MyWebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminController> _logger;

        public AdminController(ApplicationDbContext context, ILogger<AdminController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AdminLoginRequest request)
        {
            try
            {
                _logger.LogInformation($"Login attempt for email: {request.Email}");

                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { error = "Email and password are required" });
                }

                // Log the database connection state
                _logger.LogInformation($"Database connection state: {_context.Database.CanConnect()}");

                // Try to get the admin
                var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == request.Email);
                _logger.LogInformation($"Admin found: {admin != null}");

                if (admin == null)
                {
                    return Unauthorized(new { error = "Invalid credentials" });
                }

                // Simple password check without hashing
                if (request.Password != "Youssef@dima")
                {
                    return Unauthorized(new { error = "Invalid credentials" });
                }

                // Return success without token
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                // Log the full exception details
                _logger.LogError(ex, $"Error during admin login for email: {request.Email}. Full error: {ex.Message}\nStack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = $"An error occurred during login: {ex.Message}" });
            }
        }

        [HttpGet("verify")]
        public async Task<IActionResult> VerifyToken()
        {
            try
            {
                // Always return success for now
                return Ok(new
                {
                    id = 1,
                    email = "ym9612479@gmail.com",
                    name = "Admin User"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during token verification. Full error: {ex.Message}\nStack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = $"An error occurred during token verification: {ex.Message}" });
            }
        }
    }

    public class AdminLoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
} 