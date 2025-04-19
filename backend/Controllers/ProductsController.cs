using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using MyWebApp.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text.Json;

namespace MyWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(ApplicationDbContext context, ILogger<ProductsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }
            return userId;
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
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .Include(p => p.Brand)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(gender))
                    query = query.Where(p => p.Category != null && p.Category.Gender == gender);
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
                    "price_asc" => query.OrderBy(p => p.Price),
                    "price_desc" => query.OrderByDescending(p => p.Price),
                    "trending" => query.OrderByDescending(p => p.ClickCount),
                    "newest" => query.OrderByDescending(p => p.AddedAt),
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
                        CategoryName = p.Category != null ? p.Category.Name : "Unknown Category",
                        CategoryGender = p.Category != null ? p.Category.Gender : null,
                        SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                        BrandName = p.Brand != null ? p.Brand.Name : "Unknown Brand"
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products");
                return StatusCode(500, new { error = "An error occurred while getting products" });
            }
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

        [HttpGet("editors-pick")]
        public async Task<IActionResult> GetEditorsPick([FromQuery] int limit = 5)
        {
            try
            {
                var products = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .Include(p => p.Brand)
                    .Where(p => p.IsEditorsPick)
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
                        CategoryName = p.Category != null ? p.Category.Name : "Unknown Category",
                        CategoryGender = p.Category != null ? p.Category.Gender : null,
                        SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                        BrandName = p.Brand != null ? p.Brand.Name : "Unknown Brand",
                        p.IsEditorsPick
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting editor's pick products");
                return StatusCode(500, new { error = "An error occurred while getting editor's pick products" });
            }
        }

        [HttpGet("trending")]
        public async Task<IActionResult> GetTrending(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 5,
            [FromQuery] bool isHomePage = false)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .Include(p => p.Brand)
                    .AsQueryable();

                // Always sort by click count for trending products
                query = query.OrderByDescending(p => p.ClickCount);

                // For home page, we only want the top 5 most clicked products
                if (isHomePage)
                {
                    var topProducts = await query
                        .Take(5)
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
                            CategoryName = p.Category != null ? p.Category.Name : "Unknown Category",
                            CategoryGender = p.Category != null ? p.Category.Gender : null,
                            SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                            BrandName = p.Brand != null ? p.Brand.Name : "Unknown Brand",
                            p.IsEditorsPick
                        })
                        .ToListAsync();

                    return Ok(topProducts);
                }

                // For trending page, we want paginated results with 15 products per page
                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / 15.0);
                page = Math.Max(1, Math.Min(page, totalPages));

                var products = await query
                    .Skip((page - 1) * 15)
                    .Take(15)
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
                        CategoryName = p.Category != null ? p.Category.Name : "Unknown Category",
                        CategoryGender = p.Category != null ? p.Category.Gender : null,
                        SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                        BrandName = p.Brand != null ? p.Brand.Name : "Unknown Brand",
                        p.IsEditorsPick
                    })
                    .ToListAsync();

                return Ok(new
                {
                    TotalItems = totalItems,
                    TotalPages = totalPages,
                    CurrentPage = page,
                    PageSize = 15,
                    Items = products
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting trending products");
                return StatusCode(500, new { error = "An error occurred while getting trending products" });
            }
        }

        [HttpGet("liked")]
        [Authorize]
        public async Task<IActionResult> GetLikedProducts()
        {
            try
            {
                var userId = GetUserId();
                _logger.LogInformation($"Fetching liked products for user {userId}");

                var likedProducts = await _context.LikedProducts
                    .Where(lp => lp.UserId == userId)
                    .Include(lp => lp.Product)
                        .ThenInclude(p => p.Category)
                    .Include(lp => lp.Product)
                        .ThenInclude(p => p.SubCategory)
                    .Include(lp => lp.Product)
                        .ThenInclude(p => p.Brand)
                    .Select(lp => new
                    {
                        id = lp.Product.Id,
                        name = lp.Product.Name,
                        price = lp.Product.Price,
                        imageURL = lp.Product.ImageURL ?? "/images/placeholder.jpg",
                        description = lp.Product.Description,
                        discountedPrice = lp.Product.DiscountedPrice,
                        color = lp.Product.Color,
                        size = lp.Product.Size,
                        material = lp.Product.Material,
                        productURL = lp.Product.ProductURL,
                        clickCount = lp.Product.ClickCount,
                        isEditorsPick = lp.Product.IsEditorsPick,
                        brand = new { 
                            name = lp.Product.Brand.Name 
                        },
                        category = new { 
                            name = lp.Product.Category.Name,
                            gender = lp.Product.Category.Gender
                        },
                        subCategory = lp.Product.SubCategory == null ? null : new { 
                            name = lp.Product.SubCategory.Name 
                        }
                    })
                    .ToListAsync();

                _logger.LogInformation($"Found {likedProducts.Count} liked products for user {userId}");
                _logger.LogInformation($"Liked products data: {System.Text.Json.JsonSerializer.Serialize(likedProducts)}");
                return Ok(likedProducts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching liked products");
                return StatusCode(500, new { error = "Failed to fetch liked products" });
            }
        }

        [HttpGet("{id}/like")]
        [Authorize]
        public async Task<IActionResult> CheckIfLiked(int id)
        {
            try
            {
                var userId = GetUserId();
                var isLiked = await _context.LikedProducts
                    .AnyAsync(lp => lp.UserId == userId && lp.ProductId == id);

                return Ok(new { isLiked });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if product is liked");
                return StatusCode(500, new { error = "Failed to check if product is liked" });
            }
        }

        [HttpPost("{id}/like")]
        [Authorize]
        public async Task<IActionResult> ToggleLike(int id)
        {
            try
            {
                var userId = GetUserId();
                var existingLike = await _context.LikedProducts
                    .FirstOrDefaultAsync(lp => lp.UserId == userId && lp.ProductId == id);

                if (existingLike != null)
                {
                    _context.LikedProducts.Remove(existingLike);
                    await _context.SaveChangesAsync();
                    return Ok(new { isLiked = false });
                }

                var newLike = new LikedProduct
                {
                    UserId = userId,
                    ProductId = id,
                    CreatedAt = DateTime.UtcNow
                };

                _context.LikedProducts.Add(newLike);
                await _context.SaveChangesAsync();

                return Ok(new { isLiked = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling like status");
                return StatusCode(500, new { error = "Failed to toggle like status" });
            }
        }

        [HttpGet("{id}/recommendations")]
        public async Task<IActionResult> GetProductRecommendations(
            int id,
            [FromQuery] int limit = 4)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Category)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (product == null)
                    return NotFound("Product not found");

                // Get recommendations based on:
                // 1. Same category
                // 2. Similar price range (±20%)
                // 3. Exclude the current product
                var recommendations = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Brand)
                    .Where(p => p.Id != id && 
                           p.CategoryID == product.CategoryID &&
                           p.Price >= product.Price * 0.8m &&
                           p.Price <= product.Price * 1.2m)
                    .OrderByDescending(p => p.ClickCount)
                    .Take(limit)
                    .Select(p => new
                    {
                        p.Id,
                        p.Name,
                        p.Price,
                        p.DiscountedPrice,
                        p.ImageURL,
                        p.ClickCount,
                        p.LikeCount,
                        BrandName = p.Brand.Name,
                        CategoryName = p.Category.Name
                    })
                    .ToListAsync();

                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product recommendations");
                return StatusCode(500, "An error occurred while getting product recommendations");
            }
        }
    }
}
