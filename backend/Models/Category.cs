namespace MyWebApp.Models
{
    public class Category
    {
        public int ID { get; set; }  // Matches 'categories' table
        public required string Name { get; set; }
        public string? Gender { get; set; } // "Male", "Female", or null for unisex
        
        // Navigation property for related subcategories
        public ICollection<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
