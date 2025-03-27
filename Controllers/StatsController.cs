using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using MyWebApp.Models;

namespace MyWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("trending/categories")]
        public async Task<IActionResult> GetTrendingCategories(
            [FromQuery] string? gender = null,
            [FromQuery] int limit = 5)
        {
            var query = _context.Categories.AsQueryable();
            
            if (!string.IsNullOrEmpty(gender))
                query = query.Where(c => c.Gender == gender);

            var trendingCategories = await query
                .Select(c => new
                {
                    c.ID,
                    c.Name,
                    c.Gender,
                    TotalClicks = _context.Products
                        .Where(p => p.CategoryID == c.ID)
                        .Sum(p => p.ClickCount),
                    ProductCount = _context.Products
                        .Count(p => p.CategoryID == c.ID),
                    TopSubCategories = c.SubCategories
                        .OrderByDescending(sc => _context.Products
                            .Where(p => p.SubCategoryID == sc.ID)
                            .Sum(p => p.ClickCount))
                        .Take(3)
                        .Select(sc => new
                        {
                            sc.ID,
                            sc.Name,
                            ProductCount = _context.Products
                                .Count(p => p.SubCategoryID == sc.ID)
                        })
                })
                .OrderByDescending(c => c.TotalClicks)
                .Take(limit)
                .ToListAsync();

            return Ok(trendingCategories);
        }

        [HttpGet("trending/products")]
        public async Task<IActionResult> GetTrendingProducts(
            [FromQuery] string? gender = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int? brandId = null,
            [FromQuery] int limit = 10)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .AsQueryable();

            if (!string.IsNullOrEmpty(gender))
                query = query.Where(p => p.Category.Gender == gender);
            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryID == categoryId.Value);
            if (brandId.HasValue)
                query = query.Where(p => p.BrandID == brandId.Value);

            var trendingProducts = await query
                .OrderByDescending(p => p.ClickCount)
                .Take(limit)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.DiscountedPrice,
                    p.ImageURL,
                    p.Color,
                    p.Size,
                    p.Material,
                    p.ProductURL,
                    p.ClickCount,
                    CategoryName = p.Category.Name,
                    CategoryGender = p.Category.Gender,
                    SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null
                })
                .ToListAsync();

            return Ok(trendingProducts);
        }

        [HttpGet("trending/colors")]
        public async Task<IActionResult> GetTrendingColors(
            [FromQuery] string? gender = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int limit = 10)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Where(p => p.Color != null)
                .AsQueryable();

            if (!string.IsNullOrEmpty(gender))
                query = query.Where(p => p.Category.Gender == gender);
            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryID == categoryId.Value);

            var trendingColors = await query
                .GroupBy(p => p.Color)
                .Select(g => new
                {
                    Color = g.Key,
                    TotalClicks = g.Sum(p => p.ClickCount),
                    ProductCount = g.Count()
                })
                .OrderByDescending(c => c.TotalClicks)
                .Take(limit)
                .ToListAsync();

            return Ok(trendingColors);
        }

        [HttpGet("trending/sizes")]
        public async Task<IActionResult> GetTrendingSizes(
            [FromQuery] string? gender = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int limit = 10)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Where(p => p.Size != null)
                .AsQueryable();

            if (!string.IsNullOrEmpty(gender))
                query = query.Where(p => p.Category.Gender == gender);
            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryID == categoryId.Value);

            var trendingSizes = await query
                .GroupBy(p => p.Size)
                .Select(g => new
                {
                    Size = g.Key,
                    TotalClicks = g.Sum(p => p.ClickCount),
                    ProductCount = g.Count()
                })
                .OrderByDescending(s => s.TotalClicks)
                .Take(limit)
                .ToListAsync();

            return Ok(trendingSizes);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummaryStats()
        {
            var totalProducts = await _context.Products.CountAsync();
            var totalBrands = await _context.Set<Brand>().CountAsync();
            var totalCategories = await _context.Categories.CountAsync();
            var totalSubCategories = await _context.SubCategories.CountAsync();

            var productsByGender = await _context.Products
                .Include(p => p.Category)
                .GroupBy(p => p.Category.Gender)
                .Select(g => new
                {
                    Gender = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var topBrands = await _context.Set<Brand>()
                .OrderByDescending(b => _context.Products.Count(p => p.BrandID == b.ID))
                .Take(5)
                .Select(b => new
                {
                    b.Name,
                    ProductCount = _context.Products.Count(p => p.BrandID == b.ID)
                })
                .ToListAsync();

            return Ok(new
            {
                TotalProducts = totalProducts,
                TotalBrands = totalBrands,
                TotalCategories = totalCategories,
                TotalSubCategories = totalSubCategories,
                ProductsByGender = productsByGender,
                TopBrands = topBrands
            });
        }
    }
} 