using MyWebApp.Models;
using Microsoft.EntityFrameworkCore;

namespace MyWebApp.Data
{
    public static class DbSeeder
    {
        public static async Task SeedBrandsAsync(ApplicationDbContext context)
        {
            if (!context.Brands.Any())
            {
                var brands = new List<Brand>
                {
                    new Brand { Name = "Luxe Living", WebsiteURL = "https://luxeliving.com" },
                    new Brand { Name = "Urban Edge", WebsiteURL = "https://urbanedge.com" },
                    new Brand { Name = "Nature's Best", WebsiteURL = "https://naturesbest.com" },
                    new Brand { Name = "Tech Elite", WebsiteURL = "https://techelite.com" },
                    new Brand { Name = "Sport Pro", WebsiteURL = "https://sportpro.com" }
                };

                context.Brands.AddRange(brands);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedCategoriesAsync(ApplicationDbContext context)
        {
            if (!context.Categories.Any())
            {
                var categories = new List<Category>
                {
                    new Category { Name = "Men's Clothing", Gender = "Men" },
                    new Category { Name = "Women's Clothing", Gender = "Women" },
                    new Category { Name = "Accessories", Gender = null },
                    new Category { Name = "Shoes", Gender = null }
                };

                context.Categories.AddRange(categories);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedProductsAsync(ApplicationDbContext context)
        {
            if (!context.Products.Any())
            {
                var brand = await context.Brands.FirstOrDefaultAsync();
                var category = await context.Categories.FirstOrDefaultAsync();

                if (brand != null && category != null)
                {
                    var products = new List<Product>
                    {
                        new Product
                        {
                            Name = "Classic T-Shirt",
                            Description = "Comfortable cotton t-shirt",
                            Price = 29.99m,
                            DiscountedPrice = 24.99m,
                            ImageURL = "https://example.com/tshirt.jpg",
                            Color = "White",
                            Size = "M",
                            Material = "Cotton",
                            ProductURL = "https://example.com/products/classic-tshirt",
                            BrandID = brand.ID,
                            CategoryID = category.ID,
                            IsEditorsPick = true,
                            ClickCount = 0,
                            LikeCount = 0
                        },
                        new Product
                        {
                            Name = "Designer Jeans",
                            Description = "Premium denim jeans",
                            Price = 89.99m,
                            ImageURL = "https://example.com/jeans.jpg",
                            Color = "Blue",
                            Size = "32",
                            Material = "Denim",
                            ProductURL = "https://example.com/products/designer-jeans",
                            BrandID = brand.ID,
                            CategoryID = category.ID,
                            IsEditorsPick = false,
                            ClickCount = 0,
                            LikeCount = 0
                        }
                    };

                    context.Products.AddRange(products);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
} 