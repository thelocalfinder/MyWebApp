using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using MyWebApp.Models;

namespace MyWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BrandsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BrandsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBrands()
        {
            var brands = await _context.Set<Brand>()
                .Select(b => new
                {
                    b.ID,
                    b.Name,
                    b.WebsiteURL,
                    ProductCount = _context.Products.Count(p => p.BrandID == b.ID),
                    TotalClicks = _context.Products
                        .Where(p => p.BrandID == b.ID)
                        .Sum(p => p.ClickCount)
                })
                .ToListAsync();

            return Ok(brands);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBrand(int id)
        {
            var brand = await _context.Set<Brand>()
                .Select(b => new
                {
                    b.ID,
                    b.Name,
                    b.WebsiteURL,
                    ProductCount = _context.Products.Count(p => p.BrandID == b.ID),
                    TotalClicks = _context.Products
                        .Where(p => p.BrandID == b.ID)
                        .Sum(p => p.ClickCount),
                    Products = _context.Products
                        .Where(p => p.BrandID == b.ID)
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
                })
                .FirstOrDefaultAsync(b => b.ID == id);

            if (brand == null)
                return NotFound();

            return Ok(brand);
        }

        [HttpGet("{id}/products")]
        public async Task<IActionResult> GetBrandProducts(
            int id,
            [FromQuery] string? gender = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string? sortBy = "newest",
            [FromQuery] string? sortOrder = "desc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Where(p => p.BrandID == id);

            // Apply filters
            if (!string.IsNullOrEmpty(gender))
                query = query.Where(p => p.Category.Gender == gender);
            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryID == categoryId.Value);

            // Apply sorting
            query = sortBy.ToLower() switch
            {
                "price" => sortOrder.ToLower() == "desc" 
                    ? query.OrderByDescending(p => p.Price)
                    : query.OrderBy(p => p.Price),
                "popularity" => sortOrder.ToLower() == "desc"
                    ? query.OrderByDescending(p => p.ClickCount)
                    : query.OrderBy(p => p.ClickCount),
                "newest" => sortOrder.ToLower() == "desc"
                    ? query.OrderByDescending(p => p.AddedAt)
                    : query.OrderBy(p => p.AddedAt),
                _ => query.OrderByDescending(p => p.AddedAt)
            };

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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

            return Ok(new
            {
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = page,
                PageSize = pageSize,
                Items = products
            });
        }

        [HttpGet("trending")]
        public async Task<IActionResult> GetTrendingBrands([FromQuery] int limit = 10)
        {
            var trendingBrands = await _context.Set<Brand>()
                .Select(b => new
                {
                    b.ID,
                    b.Name,
                    b.WebsiteURL,
                    TotalClicks = _context.Products
                        .Where(p => p.BrandID == b.ID)
                        .Sum(p => p.ClickCount),
                    ProductCount = _context.Products
                        .Count(p => p.BrandID == b.ID)
                })
                .OrderByDescending(b => b.TotalClicks)
                .Take(limit)
                .ToListAsync();

            return Ok(trendingBrands);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchBrands(
            [FromQuery] string query,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var brandsQuery = _context.Set<Brand>()
                .Where(b => b.Name.Contains(query));

            var totalItems = await brandsQuery.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var brands = await brandsQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new
                {
                    b.ID,
                    b.Name,
                    b.WebsiteURL,
                    ProductCount = _context.Products.Count(p => p.BrandID == b.ID),
                    TotalClicks = _context.Products
                        .Where(p => p.BrandID == b.ID)
                        .Sum(p => p.ClickCount)
                })
                .ToListAsync();

            return Ok(new
            {
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = page,
                PageSize = pageSize,
                Items = brands
            });
        }
    }
} 