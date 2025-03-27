namespace MyWebApp.Models
{
    public class Product
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public string? ImageURL { get; set; }
        public int BrandID { get; set; }
        public int CategoryID { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public int? SubCategoryID { get; set; }
        public string? ProductURL { get; set; }
        public string? Material { get; set; }
        public int ClickCount { get; set; } = 0;
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Category Category { get; set; } = null!;
        public SubCategory? SubCategory { get; set; }
        public Brand Brand { get; set; } = null!;
    }
}
