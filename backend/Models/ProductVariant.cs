using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyWebApp.Models
{
    public class ProductVariant
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        [StringLength(50)]
        public string Color { get; set; }

        [StringLength(50)]
        public string Size { get; set; }

        [StringLength(100)]
        public string SKU { get; set; }

        public int StockQuantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? VariantPrice { get; set; }

        [StringLength(500)]
        public string VariantImageURL { get; set; }

        // Navigation property
        public Product Product { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
} 