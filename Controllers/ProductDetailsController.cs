using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using MyWebApp.Models;

namespace MyWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductDetailsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductDetailsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetProductsByCategoryWithDetails(int categoryId)
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

        [HttpGet("brand/{brandId}")]
        public async Task<IActionResult> GetProductsByBrandWithDetails(int brandId)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Brand)
                .Where(p => p.BrandID == brandId)
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

        [HttpGet("on-sale")]
        public async Task<IActionResult> GetProductsOnSaleWithDetails()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Brand)
                .Where(p => p.DiscountedPrice < p.Price)
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

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularProductsWithDetails([FromQuery] int limit = 10)
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

        [HttpGet("search")]
        public async Task<IActionResult> SearchProductsWithDetails(
            [FromQuery] string? query = null,
            [FromQuery] string? categoryName = null,
            [FromQuery] string? brandName = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? material = null,
            [FromQuery] string? color = null)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Brand)
                .Where(p => 
                    (string.IsNullOrEmpty(query) || 
                     p.Name.Contains(query) || 
                     (p.Description != null && p.Description.Contains(query))) &&
                    (string.IsNullOrEmpty(categoryName) || p.Category.Name.Contains(categoryName)) &&
                    (string.IsNullOrEmpty(brandName) || p.Brand.Name.Contains(brandName)) &&
                    (!minPrice.HasValue || p.Price >= minPrice.Value) &&
                    (!maxPrice.HasValue || p.Price <= maxPrice.Value) &&
                    (string.IsNullOrEmpty(material) || p.Material == material) &&
                    (string.IsNullOrEmpty(color) || p.Color == color))
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
    }
} 