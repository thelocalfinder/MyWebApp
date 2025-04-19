using System.ComponentModel.DataAnnotations;

namespace MyWebApp.Models
{
    public class User
    {
        public int ID { get; set; }
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        [Required]
        public required string PasswordHash { get; set; }
        public string? Name { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }
        
        // Navigation property
        public ICollection<Like> Likes { get; set; } = new List<Like>();
    }
} 