namespace MyWebApp.Models
{
    public class Brand
    {
        public int ID { get; set; }
        public required string Name { get; set; }
        public string? WebsiteURL { get; set; }
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
} 