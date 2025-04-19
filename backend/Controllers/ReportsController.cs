using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using System.Text;
using CsvHelper;
using System.Globalization;

namespace MyWebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/reports")]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("brands/summary")]
        public async Task<IActionResult> GetBrandsSummary()
        {
            try
            {
                var brandSummaries = await _context.Brands
                    .Select(b => new
                    {
                        BrandName = b.Name,
                        ProductCount = b.Products.Count,
                        TotalClicks = b.Products.Sum(p => p.ClickCount),
                        AveragePrice = b.Products.Average(p => p.Price),
                        TopProduct = b.Products.OrderByDescending(p => p.ClickCount)
                                              .Select(p => p.Name)
                                              .FirstOrDefault()
                    })
                    .ToListAsync();

                var csv = new StringBuilder();
                csv.AppendLine("Brand Name,Product Count,Total Clicks,Average Price,Top Product");

                foreach (var summary in brandSummaries)
                {
                    csv.AppendLine($"{summary.BrandName},{summary.ProductCount},{summary.TotalClicks},{summary.AveragePrice:F2},{summary.TopProduct}");
                }

                byte[] bytes = Encoding.UTF8.GetBytes(csv.ToString());
                return File(bytes, "text/csv", "brands-summary.csv");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to generate report", details = ex.Message });
            }
        }

        [HttpGet("brands/{brandId}")]
        public async Task<IActionResult> GetBrandReport(int brandId)
        {
            try
            {
                var brand = await _context.Brands
                    .Include(b => b.Products)
                    .FirstOrDefaultAsync(b => b.ID == brandId);

                if (brand == null)
                {
                    return NotFound(new { error = "Brand not found" });
                }

                var productDetails = brand.Products.Select(p => new
                {
                    ProductName = p.Name,
                    Price = p.Price,
                    DiscountedPrice = p.DiscountedPrice,
                    ClickCount = p.ClickCount,
                    Category = p.Category?.Name,
                    SubCategory = p.SubCategory?.Name,
                    IsEditorsPick = p.IsEditorsPick
                }).ToList();

                var csv = new StringBuilder();
                csv.AppendLine("Product Name,Price,Discounted Price,Click Count,Category,Sub Category,Editor's Pick");

                foreach (var product in productDetails)
                {
                    csv.AppendLine($"{product.ProductName},{product.Price:F2},{product.DiscountedPrice:F2},{product.ClickCount},{product.Category},{product.SubCategory},{product.IsEditorsPick}");
                }

                byte[] bytes = Encoding.UTF8.GetBytes(csv.ToString());
                return File(bytes, "text/csv", $"{brand.Name}-report.csv");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to generate report", details = ex.Message });
            }
        }
    }
} 