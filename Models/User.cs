namespace MyWebApp.Models
{
    public class User
    {
        public int ID { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public string? Name { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public ICollection<Like> Likes { get; set; } = new List<Like>();
    }
} 