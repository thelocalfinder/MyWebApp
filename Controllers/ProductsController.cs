using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using MyWebApp.Models;

namespace MyWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string? gender = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int? subCategoryId = null,
            [FromQuery] string? color = null,
            [FromQuery] string? size = null,
            [FromQuery] string? material = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = "newest",
            [FromQuery] string? sortOrder = "desc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Brand)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(gender))
                query = query.Where(p => p.Category.Gender == gender);
            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryID == categoryId.Value);
            if (subCategoryId.HasValue)
                query = query.Where(p => p.SubCategoryID == subCategoryId.Value);
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
                    SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                    BrandName = p.Brand.Name
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Brand)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound();

            return Ok(new
            {
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.DiscountedPrice,
                product.ImageURL,
                product.Color,
                product.Size,
                product.Material,
                product.ProductURL,
                product.ClickCount,
                CategoryName = product.Category.Name,
                CategoryGender = product.Category.Gender,
                SubCategoryName = product.SubCategory?.Name,
                BrandName = product.Brand.Name
            });
        }

        [HttpPost("{id}/click")]
        public async Task<IActionResult> TrackProductClick(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            // Increment click count
            product.ClickCount++;
            await _context.SaveChangesAsync();

            // Return the product URL for redirection
            return Ok(new { redirectUrl = product.ProductURL });
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetProductsByCategory(int categoryId)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Brand)
                .Where(p => p.CategoryID == categoryId)
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
                    SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                    BrandName = p.Brand.Name
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("color/{color}")]
        public async Task<IActionResult> GetProductsByColor(string color)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Brand)
                .Where(p => p.Color == color)
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
                    SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                    BrandName = p.Brand.Name
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("material/{material}")]
        public async Task<IActionResult> GetProductsByMaterial(string material)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Brand)
                .Where(p => p.Material == material)
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
                    SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                    BrandName = p.Brand.Name
                })
                .ToListAsync();

            return Ok(products);
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
                searchQuery = searchQuery.Where(p => p.Category.Gender == gender);
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

            var totalItems = await searchQuery.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var products = await searchQuery
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
                    SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                    BrandName = p.Brand.Name
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

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
