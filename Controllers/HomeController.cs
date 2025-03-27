using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using MyWebApp.Models;

namespace MyWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HomeController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("editors-pick")]
        public async Task<IActionResult> GetEditorsPick([FromQuery] int limit = 10)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Brand)
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
                    p.ClickCount,
                    p.AddedAt,
                    p.ProductURL,
                    CategoryName = p.Category.Name,
                    SubCategoryName = p.SubCategory.Name,
                    BrandName = p.Brand.Name
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("categories/{gender}")]
        public async Task<IActionResult> GetCategoriesByGender(string gender)
        {
            var categories = await _context.Categories
                .Where(c => c.Gender == gender || c.Gender == "Unisex")
                .Select(c => new
                {
                    c.ID,
                    c.Name,
                    SubCategories = c.SubCategories.Select(sc => new
                    {
                        sc.ID,
                        sc.Name
                    })
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("subcategories/{categoryId}")]
        public async Task<IActionResult> GetSubCategories(int categoryId)
        {
            var subCategories = await _context.SubCategories
                .Where(sc => sc.CategoryID == categoryId)
                .Select(sc => new
                {
                    sc.ID,
                    sc.Name
                })
                .ToListAsync();

            return Ok(subCategories);
        }

        [HttpGet("products/subcategory/{subCategoryId}")]
        public async Task<IActionResult> GetProductsBySubCategory(
            int subCategoryId,
            [FromQuery] string? color = null,
            [FromQuery] string? size = null,
            [FromQuery] string? material = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = "popularity",
            [FromQuery] string? sortOrder = "desc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Brand)
                .Where(p => p.SubCategoryID == subCategoryId);

            // Apply filters
            if (!string.IsNullOrEmpty(color))
                query = query.Where(p => p.Color == color);
            if (!string.IsNullOrEmpty(size))
                query = query.Where(p => p.Size == size);
            if (!string.IsNullOrEmpty(material))
                query = query.Where(p => p.Material == material);
            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);
            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

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
                _ => query.OrderByDescending(p => p.ClickCount)
            };

            // Apply pagination
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            var items = await query
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
                    p.ClickCount,
                    p.AddedAt,
                    p.ProductURL,
                    CategoryName = p.Category.Name,
                    SubCategoryName = p.SubCategory.Name,
                    BrandName = p.Brand.Name
                })
                .ToListAsync();

            return Ok(new
            {
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = page,
                PageSize = pageSize,
                Items = items
            });
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchProducts(
            [FromQuery] string query,
            [FromQuery] string? gender = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int? subCategoryId = null,
            [FromQuery] string? color = null,
            [FromQuery] string? size = null,
            [FromQuery] string? material = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = "relevance",
            [FromQuery] string? sortOrder = "desc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var searchQuery = _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Brand)
                .Where(p => p.Name.Contains(query) || 
                           (p.Description != null && p.Description.Contains(query)));

            // Apply filters
            if (!string.IsNullOrEmpty(gender))
                searchQuery = searchQuery.Where(p => p.Category.Gender == gender || p.Category.Gender == "Unisex");
            if (categoryId.HasValue)
                searchQuery = searchQuery.Where(p => p.CategoryID == categoryId.Value);
            if (subCategoryId.HasValue)
                searchQuery = searchQuery.Where(p => p.SubCategoryID == subCategoryId.Value);
            if (!string.IsNullOrEmpty(color))
                searchQuery = searchQuery.Where(p => p.Color == color);
            if (!string.IsNullOrEmpty(size))
                searchQuery = searchQuery.Where(p => p.Size == size);
            if (!string.IsNullOrEmpty(material))
                searchQuery = searchQuery.Where(p => p.Material == material);
            if (minPrice.HasValue)
                searchQuery = searchQuery.Where(p => p.Price >= minPrice.Value);
            if (maxPrice.HasValue)
                searchQuery = searchQuery.Where(p => p.Price <= maxPrice.Value);

            // Apply sorting
            searchQuery = sortBy.ToLower() switch
            {
                "price" => sortOrder.ToLower() == "desc"
                    ? searchQuery.OrderByDescending(p => p.Price)
                    : searchQuery.OrderBy(p => p.Price),
                "popularity" => sortOrder.ToLower() == "desc"
                    ? searchQuery.OrderByDescending(p => p.ClickCount)
                    : searchQuery.OrderBy(p => p.ClickCount),
                "newest" => sortOrder.ToLower() == "desc"
                    ? searchQuery.OrderByDescending(p => p.AddedAt)
                    : searchQuery.OrderBy(p => p.AddedAt),
                _ => searchQuery.OrderByDescending(p => p.ClickCount)
            };

            // Apply pagination
            var totalItems = await searchQuery.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            var items = await searchQuery
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
                    p.ClickCount,
                    p.AddedAt,
                    p.ProductURL,
                    CategoryName = p.Category.Name,
                    SubCategoryName = p.SubCategory.Name,
                    BrandName = p.Brand.Name
                })
                .ToListAsync();

            return Ok(new
            {
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = page,
                PageSize = pageSize,
                Items = items
            });
        }
    }
} 