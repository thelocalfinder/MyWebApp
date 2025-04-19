using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using MyWebApp.Models;
using System.Text;
using CsvHelper;
using System.Globalization;

namespace MyWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ExportController> _logger;

        public ExportController(ApplicationDbContext context, ILogger<ExportController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("products")]
        public async Task<IActionResult> ExportProducts(
            [FromQuery] int? brandId = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string? color = null,
            [FromQuery] string? size = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] bool? onSale = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                _logger.LogInformation("Starting products export");
                
                var query = _context.Products
                    .Include(p => p.Brand)
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .AsQueryable();

                // Apply filters
                if (brandId.HasValue)
                    query = query.Where(p => p.BrandID == brandId);
                if (categoryId.HasValue)
                    query = query.Where(p => p.CategoryID == categoryId);
                if (!string.IsNullOrEmpty(color))
                    query = query.Where(p => p.Color == color);
                if (!string.IsNullOrEmpty(size))
                    query = query.Where(p => p.Size == size);
                if (minPrice.HasValue)
                    query = query.Where(p => p.Price >= minPrice);
                if (maxPrice.HasValue)
                    query = query.Where(p => p.Price <= maxPrice);
                if (onSale.HasValue)
                    query = query.Where(p => p.DiscountedPrice != null);
                if (startDate.HasValue)
                    query = query.Where(p => p.AddedAt >= startDate);
                if (endDate.HasValue)
                    query = query.Where(p => p.AddedAt <= endDate);

                var products = await query
                    .Select(p => new
                    {
                        p.Id,
                        p.Name,
                        BrandName = p.Brand.Name,
                        CategoryName = p.Category.Name,
                        SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : "",
                        p.ClickCount,
                        p.Price,
                        p.DiscountedPrice,
                        p.Color,
                        p.Size,
                        p.Material,
                        p.ProductURL,
                        p.AddedAt
                    })
                    .OrderByDescending(p => p.ClickCount)
                    .ToListAsync();

                _logger.LogInformation($"Found {products.Count} products to export");

                if (products.Count == 0)
                {
                    _logger.LogWarning("No products found to export");
                    return NotFound("No products found matching the specified criteria");
                }

                var csv = new StringBuilder();
                csv.AppendLine("ID,Name,Brand,Category,SubCategory,Clicks,Price,DiscountedPrice,Color,Size,Material,URL,AddedDate");

                foreach (var product in products)
                {
                    csv.AppendLine($"{product.Id},{EscapeCsvField(product.Name)},{EscapeCsvField(product.BrandName)},{EscapeCsvField(product.CategoryName)},{EscapeCsvField(product.SubCategoryName)},{product.ClickCount},{product.Price},{product.DiscountedPrice},{EscapeCsvField(product.Color)},{EscapeCsvField(product.Size)},{EscapeCsvField(product.Material)},{EscapeCsvField(product.ProductURL)},{product.AddedAt:yyyy-MM-dd HH:mm:ss}");
                }

                _logger.LogInformation("Products export completed successfully");
                return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "products.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting products");
                return StatusCode(500, "An error occurred while exporting products");
            }
        }

        [HttpGet("admin/brands")]
        public async Task<IActionResult> ExportAllBrands()
        {
            try
            {
                _logger.LogInformation("Starting admin brands export");
                
                var brands = await _context.Brands
                    .Include(b => b.Products)
                        .ThenInclude(p => p.Category)
                    .Select(b => new
                    {
                        Brand = new
                        {
                            b.ID,
                            b.Name,
                            b.WebsiteURL,
                            ProductCount = b.Products.Count(),
                            TotalClicks = b.Products.Sum(p => p.ClickCount),
                            TotalLikes = b.Products.Sum(p => p.LikeCount)
                        },
                        Products = b.Products.Select(p => new
                        {
                            p.Id,
                            p.Name,
                            p.Price,
                            p.DiscountedPrice,
                            CategoryName = p.Category.Name,
                            p.ClickCount,
                            p.LikeCount,
                            p.AddedAt
                        })
                    })
                    .OrderByDescending(b => b.Brand.TotalClicks)
                    .ToListAsync();

                _logger.LogInformation($"Found {brands.Count} brands to export");

                if (brands.Count == 0)
                {
                    _logger.LogWarning("No brands found to export");
                    return NotFound("No brands found");
                }

                var csv = new StringBuilder();
                
                foreach (var brand in brands)
                {
                    // Write brand summary
                    csv.AppendLine($"Brand: {brand.Brand.Name}");
                    csv.AppendLine("ID,Name,Website,ProductCount,TotalClicks,TotalLikes");
                    csv.AppendLine($"{brand.Brand.ID},{EscapeCsvField(brand.Brand.Name)},{EscapeCsvField(brand.Brand.WebsiteURL)},{brand.Brand.ProductCount},{brand.Brand.TotalClicks},{brand.Brand.TotalLikes}");
                    csv.AppendLine();

                    // Write products details
                    csv.AppendLine("Products:");
                    csv.AppendLine("ID,Name,Category,Price,Discounted Price,Clicks,Likes,Added Date");
                    foreach (var product in brand.Products.OrderByDescending(p => p.ClickCount))
                    {
                        csv.AppendLine($"{product.Id}," +
                            $"{EscapeCsvField(product.Name)}," +
                            $"{EscapeCsvField(product.CategoryName)}," +
                            $"{product.Price:F2}," +
                            $"{(product.DiscountedPrice.HasValue ? product.DiscountedPrice.Value.ToString("F2") : "")}," +
                            $"{product.ClickCount}," +
                            $"{product.LikeCount}," +
                            $"{product.AddedAt:yyyy-MM-dd HH:mm:ss}");
                    }
                    csv.AppendLine();
                    csv.AppendLine("----------------------------------------");
                    csv.AppendLine();
                }

                _logger.LogInformation("Admin brands export completed successfully");
                return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "all_brands.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting admin brands");
                return StatusCode(500, "An error occurred while exporting admin brands");
            }
        }

        [HttpGet("brands/{brandId:int}")]
        public async Task<IActionResult> ExportBrandById([FromRoute] int brandId)
        {
            try
            {
                if (brandId <= 0)
                {
                    _logger.LogWarning($"Invalid brand ID provided: {brandId}");
                    return BadRequest("Invalid brand ID");
                }

                _logger.LogInformation($"Starting brand export for ID: {brandId}");

                var brand = await _context.Brands
                    .Include(b => b.Products)
                        .ThenInclude(p => p.Category)
                    .FirstOrDefaultAsync(b => b.ID == brandId);

                if (brand == null)
                {
                    _logger.LogWarning($"Brand with ID {brandId} not found");
                    return NotFound($"Brand with ID {brandId} not found");
                }

                var csv = new StringBuilder();
                
                // Write brand name at top
                csv.AppendLine($"Brand: {brand.Name}");
                csv.AppendLine();

                // Write products details
                csv.AppendLine("Products:");
                csv.AppendLine("Name,Category,Clicks,Likes");
                foreach (var product in brand.Products.OrderByDescending(p => p.ClickCount))
                {
                    csv.AppendLine($"{EscapeCsvField(product.Name)}," +
                        $"{EscapeCsvField(product.Category.Name)}," +
                        $"{product.ClickCount}," +
                        $"{product.LikeCount}");
                }
                csv.AppendLine();

                // Calculate brand summary
                var productCount = brand.Products.Count;
                var totalClicks = brand.Products.Sum(p => p.ClickCount);
                var averageClicks = productCount > 0 ? (double)totalClicks / productCount : 0;
                var totalLikes = brand.Products.Sum(p => p.LikeCount);

                // Write brand summary at bottom
                csv.AppendLine("Brand Summary:");
                csv.AppendLine("Total Products,Total Clicks,Average Clicks,Total Likes");
                csv.AppendLine($"{productCount}," +
                    $"{totalClicks}," +
                    $"{averageClicks:F2}," +
                    $"{totalLikes}");

                _logger.LogInformation($"Brand export completed successfully for ID: {brandId}");
                return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", $"brand_{brandId}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error exporting brand {brandId}");
                return StatusCode(500, $"An error occurred while exporting brand {brandId}");
            }
        }

        [HttpGet("categories")]
        public async Task<IActionResult> ExportCategories(
            [FromQuery] string? gender = null)
        {
            try
            {
                _logger.LogInformation("Starting categories export");
                
                var query = _context.Categories
                    .Include(c => c.Products)
                    .Include(c => c.SubCategories)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(gender))
                    query = query.Where(c => c.Gender == gender);

                var categories = await query
                    .Select(c => new
                    {
                        c.ID,
                        c.Name,
                        c.Gender,
                        ProductCount = c.Products.Count,
                        TotalClicks = c.Products.Sum(p => p.ClickCount),
                        SubCategoryCount = c.SubCategories.Count,
                        TotalRevenue = c.Products.Sum(p => p.DiscountedPrice ?? p.Price)
                    })
                    .OrderByDescending(c => c.TotalClicks)
                    .ToListAsync();

                _logger.LogInformation($"Found {categories.Count} categories to export");

                if (categories.Count == 0)
                {
                    _logger.LogWarning("No categories found to export");
                    return NotFound("No categories found matching the specified criteria");
                }

                var csv = new StringBuilder();
                csv.AppendLine("ID,Name,Gender,ProductCount,TotalClicks,SubCategoryCount,TotalRevenue");

                foreach (var category in categories)
                {
                    csv.AppendLine($"{category.ID},{EscapeCsvField(category.Name)},{EscapeCsvField(category.Gender)},{category.ProductCount},{category.TotalClicks},{category.SubCategoryCount},{category.TotalRevenue:F2}");
                }

                _logger.LogInformation("Categories export completed successfully");
                return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "categories.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting categories");
                return StatusCode(500, "An error occurred while exporting categories");
            }
        }

        [HttpGet("daily-stats")]
        public async Task<IActionResult> ExportDailyStats(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                _logger.LogInformation("Starting daily stats export");
                
                var query = _context.Products.AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(p => p.AddedAt >= startDate);
                if (endDate.HasValue)
                    query = query.Where(p => p.AddedAt <= endDate);

                var dailyStats = await query
                    .GroupBy(p => p.AddedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        ProductCount = g.Count(),
                        TotalClicks = g.Sum(p => p.ClickCount),
                        AverageClicks = g.Average(p => p.ClickCount),
                        TotalRevenue = g.Sum(p => p.DiscountedPrice ?? p.Price),
                        NewProducts = g.Count(p => p.AddedAt.Date == g.Key),
                        OnSaleCount = g.Count(p => p.DiscountedPrice != null)
                    })
                    .OrderByDescending(s => s.Date)
                    .ToListAsync();

                _logger.LogInformation($"Found {dailyStats.Count} days of stats to export");

                if (dailyStats.Count == 0)
                {
                    _logger.LogWarning("No daily stats found to export");
                    return NotFound("No daily statistics found matching the specified criteria");
                }

                var csv = new StringBuilder();
                csv.AppendLine("Date,ProductCount,TotalClicks,AverageClicks,TotalRevenue,NewProducts,OnSaleCount");

                foreach (var stat in dailyStats)
                {
                    csv.AppendLine($"{stat.Date:yyyy-MM-dd},{stat.ProductCount},{stat.TotalClicks},{stat.AverageClicks:F2},{stat.TotalRevenue:F2},{stat.NewProducts},{stat.OnSaleCount}");
                }

                _logger.LogInformation("Daily stats export completed successfully");
                return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "daily_stats.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting daily stats");
                return StatusCode(500, "An error occurred while exporting daily statistics");
            }
        }

        [HttpGet("weekly-stats")]
        public async Task<IActionResult> ExportWeeklyStats(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                _logger.LogInformation("Starting weekly stats export");
                
                var query = _context.Products.AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(p => p.AddedAt >= startDate);
                if (endDate.HasValue)
                    query = query.Where(p => p.AddedAt <= endDate);

                var weeklyStats = await query
                    .GroupBy(p => new { 
                        Year = p.AddedAt.Year, 
                        Week = (p.AddedAt.DayOfYear - 1) / 7 + 1 
                    })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Week = g.Key.Week,
                        ProductCount = g.Count(),
                        TotalClicks = g.Sum(p => p.ClickCount),
                        AverageClicks = g.Average(p => p.ClickCount),
                        TotalRevenue = g.Sum(p => p.DiscountedPrice ?? p.Price),
                        NewProducts = g.Count(p => p.AddedAt.Year == g.Key.Year),
                        OnSaleCount = g.Count(p => p.DiscountedPrice != null)
                    })
                    .OrderByDescending(s => s.Year)
                    .ThenByDescending(s => s.Week)
                    .ToListAsync();

                _logger.LogInformation($"Found {weeklyStats.Count} weeks of stats to export");

                if (weeklyStats.Count == 0)
                {
                    _logger.LogWarning("No weekly stats found to export");
                    return NotFound("No weekly statistics found matching the specified criteria");
                }

                var csv = new StringBuilder();
                csv.AppendLine("Year,Week,ProductCount,TotalClicks,AverageClicks,TotalRevenue,NewProducts,OnSaleCount");

                foreach (var stat in weeklyStats)
                {
                    csv.AppendLine($"{stat.Year},{stat.Week},{stat.ProductCount},{stat.TotalClicks},{stat.AverageClicks:F2},{stat.TotalRevenue:F2},{stat.NewProducts},{stat.OnSaleCount}");
                }

                _logger.LogInformation("Weekly stats export completed successfully");
                return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "weekly_stats.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting weekly stats");
                return StatusCode(500, "An error occurred while exporting weekly statistics");
            }
        }

        [HttpGet("brand/{brandId}/products")]
        public async Task<IActionResult> ExportBrandProducts(int brandId)
        {
            try
            {
                _logger.LogInformation($"Starting products export for brand {brandId}");
                
                var brand = await _context.Brands
                    .Include(b => b.Products)
                    .FirstOrDefaultAsync(b => b.ID == brandId);

                if (brand == null)
                {
                    _logger.LogWarning($"Brand {brandId} not found");
                    return NotFound("Brand not found");
                }

                var products = await _context.Products
                    .Where(p => p.BrandID == brandId)
                    .Select(p => new
                    {
                        p.Id,
                        p.Name,
                        p.Price,
                        p.DiscountedPrice,
                        p.ClickCount,
                        p.LikeCount,
                        p.AddedAt,
                        CategoryName = p.Category.Name,
                        SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : ""
                    })
                    .OrderByDescending(p => p.ClickCount)
                    .ToListAsync();

                _logger.LogInformation($"Found {products.Count} products for brand {brand.Name}");

                var csv = new StringBuilder();
                csv.AppendLine("ID,Name,Price,DiscountedPrice,Clicks,Likes,AddedDate,Category,SubCategory");

                foreach (var product in products)
                {
                    csv.AppendLine($"{product.Id},{EscapeCsvField(product.Name)},{product.Price:F2},{product.DiscountedPrice?.ToString("F2") ?? ""},{product.ClickCount},{product.LikeCount},{product.AddedAt:yyyy-MM-dd HH:mm:ss},{EscapeCsvField(product.CategoryName)},{EscapeCsvField(product.SubCategoryName)}");
                }

                _logger.LogInformation($"Brand products export completed successfully for {brand.Name}");
                return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", $"{brand.Name.ToLower().Replace(" ", "_")}_products.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting brand products");
                return StatusCode(500, "An error occurred while exporting brand products");
            }
        }

        private string EscapeCsvField(string? field)
        {
            if (field == null) return "";
            
            if (field.Contains(",") || field.Contains("\"") || field.Contains("\n"))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }
            return field;
        }
    }
} 