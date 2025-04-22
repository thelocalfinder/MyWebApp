using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using MyWebApp.Models;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace MyWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, ILogger<AuthController> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpGet("verify")]
        public IActionResult VerifyToken()
        {
            try
            {
                var authHeader = Request.Headers["Authorization"].FirstOrDefault();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    _logger.LogWarning("Token verification failed: No bearer token provided");
                    return Unauthorized(new { error = "No token provided" });
                }

                var token = authHeader.Substring("Bearer ".Length);
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not found"));

                try
                {
                    var tokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidIssuer = _configuration["Jwt:Issuer"],
                        ValidAudience = _configuration["Jwt:Audience"],
                        ClockSkew = TimeSpan.Zero
                    };

                    var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var validatedToken);
                    var userId = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

                    if (string.IsNullOrEmpty(userId))
                    {
                        _logger.LogWarning("Token verification failed: No user ID in token");
                        return Unauthorized(new { error = "Invalid token" });
                    }

                    var user = _context.Users.Find(int.Parse(userId));
                    if (user == null)
                    {
                        _logger.LogWarning($"Token verification failed: User {userId} not found");
                        return Unauthorized(new { error = "Invalid token" });
                    }

                    return Ok(new
                    {
                        id = user.ID,
                        email = user.Email,
                        name = user.Name
                    });
                }
                catch (SecurityTokenExpiredException)
                {
                    _logger.LogWarning("Token verification failed: Token expired");
                    return Unauthorized(new { error = "Token expired" });
                }
                catch (SecurityTokenException ex)
                {
                    _logger.LogWarning($"Token verification failed: {ex.Message}");
                    return Unauthorized(new { error = "Invalid token" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token verification");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        private string GenerateJwtToken(User user)
        {
            try
            {
                var jwtKey = _configuration["Jwt:Key"];
                var jwtIssuer = _configuration["Jwt:Issuer"];
                var jwtAudience = _configuration["Jwt:Audience"];

                _logger.LogInformation("JWT Configuration - Key exists: {KeyExists}, Issuer exists: {IssuerExists}, Audience exists: {AudienceExists}",
                    !string.IsNullOrEmpty(jwtKey),
                    !string.IsNullOrEmpty(jwtIssuer),
                    !string.IsNullOrEmpty(jwtAudience));

                if (string.IsNullOrEmpty(jwtKey))
                    throw new InvalidOperationException("JWT key is not configured");
                if (string.IsNullOrEmpty(jwtIssuer))
                    throw new InvalidOperationException("JWT issuer is not configured");
                if (string.IsNullOrEmpty(jwtAudience))
                    throw new InvalidOperationException("JWT audience is not configured");

                // Ensure key is at least 256 bits (32 bytes)
                byte[] keyBytes;
                try
                {
                    keyBytes = Convert.FromBase64String(jwtKey);
                }
                catch (FormatException)
                {
                    // If not Base64, use UTF8 encoding and pad if necessary
                    keyBytes = Encoding.UTF8.GetBytes(jwtKey);
                    if (keyBytes.Length < 32)
                    {
                        var paddedBytes = new byte[32];
                        Buffer.BlockCopy(keyBytes, 0, paddedBytes, 0, keyBytes.Length);
                        // Fill remaining bytes with a repeating pattern
                        for (int i = keyBytes.Length; i < 32; i++)
                        {
                            paddedBytes[i] = (byte)(keyBytes[i % keyBytes.Length] ^ 0xFF);
                        }
                        keyBytes = paddedBytes;
                    }
                }

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.ID.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                var key = new SymmetricSecurityKey(keyBytes);
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires: DateTime.Now.AddDays(30),
                    signingCredentials: creds
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT token: {Message}", ex.Message);
                throw new InvalidOperationException($"Failed to generate JWT token: {ex.Message}", ex);
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest model)
        {
            try
            {
                _logger.LogInformation("Starting registration process for email: {Email}", model.Email);

                // Validate request
                if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password))
                {
                    _logger.LogWarning("Registration failed: Email or password is empty");
                    return BadRequest(new { error = "Email and password are required" });
                }

                // Log database connection state
                _logger.LogInformation("Database connection state: {State}", _context.Database.CanConnect());

                // Check if email exists with detailed logging
                _logger.LogInformation("Checking if email exists: {Email}", model.Email);
                var existingUser = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.Email.ToLower() == model.Email.ToLower())
                    .FirstOrDefaultAsync();

                _logger.LogInformation("Existing user check result: {Result}", existingUser != null);

                if (existingUser != null)
                {
                    _logger.LogWarning("Registration failed: Email {Email} already registered", model.Email);
                    return BadRequest(new { error = "Email already registered" });
                }

                // Create user object
                var user = new User
                {
                    Email = model.Email.ToLower(),
                    PasswordHash = HashPassword(model.Password),
                    Name = string.IsNullOrEmpty(model.Name) ? model.Email.Split('@')[0] : model.Name,
                    CreatedAt = DateTime.UtcNow
                };

                _logger.LogInformation("Created new user object for {Email} with Name: {Name}", model.Email, user.Name);

                try
                {
                    _logger.LogInformation("Attempting to add user to database");
                    await _context.Users.AddAsync(user);
                    
                    _logger.LogInformation("User added to context, attempting to save changes");
                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation("Successfully saved user {Email} to database with ID: {ID}", model.Email, user.ID);
                }
                catch (DbUpdateException ex)
                {
                    _logger.LogError(ex, "Database error while saving user {Email}: {Message}", model.Email, ex.Message);
                    if (ex.InnerException != null)
                    {
                        _logger.LogError("Inner exception: {Message}", ex.InnerException.Message);
                        return StatusCode(500, new { error = "Registration failed", details = ex.Message, innerError = ex.InnerException.Message });
                    }
                    return StatusCode(500, new { error = "Registration failed", details = ex.Message });
                }

                try
                {
                    _logger.LogInformation("Attempting to generate JWT token for user {ID}", user.ID);
                    
                    var jwtKey = _configuration["Jwt:Key"];
                    var jwtIssuer = _configuration["Jwt:Issuer"];
                    var jwtAudience = _configuration["Jwt:Audience"];

                    if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
                    {
                        throw new InvalidOperationException("JWT configuration is incomplete");
                    }

                    var token = GenerateJwtToken(user);
                    _logger.LogInformation("Successfully generated JWT token for user {ID}", user.ID);

                    return Ok(new { 
                        id = user.ID,
                        email = user.Email,
                        name = user.Name,
                        token = token 
                    });
                }
                catch (Exception tokenEx)
                {
                    _logger.LogError(tokenEx, "Failed to generate JWT token for user {ID}: {Message}", user.ID, tokenEx.Message);
                    return StatusCode(500, new { 
                        error = "Registration failed", 
                        details = "Failed to generate authentication token",
                        message = tokenEx.Message
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during registration for {Email}: {Message}", 
                    model.Email, ex.Message);
                return StatusCode(500, new { 
                    error = "Registration failed", 
                    details = ex.Message,
                    stackTrace = ex.StackTrace // Include stack trace for debugging
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                _logger.LogInformation("Login attempt for email: {Email}", request.Email);

                // Find user
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    _logger.LogWarning("Login failed: User not found for email: {Email}", request.Email);
                    return BadRequest(new { error = "Invalid email or password" });
                }

                // Verify password
                var hashedPassword = HashPassword(request.Password);
                if (user.PasswordHash != hashedPassword)
                {
                    _logger.LogWarning("Login failed: Invalid password for email: {Email}", request.Email);
                    return BadRequest(new { error = "Invalid email or password" });
                }

                var token = GenerateJwtToken(user);

                _logger.LogInformation("User logged in successfully: {Email}", request.Email);

                // Return user data (excluding password)
                return Ok(new
                {
                    id = user.ID,
                    email = user.Email,
                    name = user.Name,
                    token = token
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login failed for email: {Email}. Error: {Message}\nStack trace: {StackTrace}", 
                    request.Email, ex.Message, ex.StackTrace);
                return StatusCode(500, new { error = "Login failed", details = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    // Return success even if user doesn't exist to prevent email enumeration
                    return Ok(new { message = "If your email is registered, you will receive password reset instructions" });
                }

                // Generate reset token
                var resetToken = GenerateResetToken();
                user.ResetToken = resetToken;
                user.ResetTokenExpiry = DateTime.UtcNow.AddHours(24);

                await _context.SaveChangesAsync();

                // Send email with reset link
                var resetLink = $"{_configuration["Frontend:BaseUrl"]}/reset-password?token={resetToken}";
                var emailSubject = "Reset Your Password";
                var emailBody = $@"
                    <h2>Reset Your Password</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password. Click the link below to set a new password:</p>
                    <p><a href='{resetLink}'>Reset Password</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <p>Best regards,<br>Fashion Platform Team</p>";

                using (var client = new System.Net.Mail.SmtpClient(_configuration["Email:SmtpServer"], int.Parse(_configuration["Email:Port"])))
                {
                    client.EnableSsl = true;
                    client.Credentials = new System.Net.NetworkCredential(_configuration["Email:Username"], _configuration["Email:Password"]);

                    var mailMessage = new System.Net.Mail.MailMessage
                    {
                        From = new System.Net.Mail.MailAddress(_configuration["Email:From"], "Fashion Platform"),
                        Subject = emailSubject,
                        Body = emailBody,
                        IsBodyHtml = true
                    };
                    mailMessage.To.Add(user.Email);

                    try
                    {
                        await client.SendMailAsync(mailMessage);
                        _logger.LogInformation($"Password reset email sent to {user.Email}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Failed to send password reset email to {user.Email}");
                        // Don't expose email sending errors to the client
                    }
                }

                return Ok(new { 
                    message = "If your email is registered, you will receive password reset instructions"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process password reset request");
                return StatusCode(500, new { message = "Failed to process password reset request" });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.ResetToken == request.Token && 
                                            u.ResetTokenExpiry > DateTime.UtcNow);

                if (user == null)
                {
                    return BadRequest(new { message = "Invalid or expired reset token" });
                }

                // Update password
                user.PasswordHash = HashPassword(request.NewPassword);
                user.ResetToken = null;
                user.ResetTokenExpiry = null;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Password has been reset successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to reset password", error = ex.Message });
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private string GenerateResetToken()
        {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        }
    }

    public class RegisterRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Name { get; set; }
    }

    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
} 