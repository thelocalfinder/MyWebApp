using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Net.Http;
using System.Threading.Tasks;
using MyWebApp.Data;
using MyWebApp.Models;
using Microsoft.EntityFrameworkCore;

namespace MyWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScraperController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ScraperController> _logger;

        public ScraperController(
            ApplicationDbContext context,
            IHttpClientFactory httpClientFactory,
            ILogger<ScraperController> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // Direct store access - works for any public Shopify store
        [HttpPost("shopify/direct")]
        public async Task<IActionResult> ScrapeShopifyDirect([FromBody] ShopifyScrapeRequest request)
        {
            try
            {
                _logger.LogInformation($"Starting direct Shopify scrape for store: {request.StoreName}");
                return await ScrapeUsingDirectAccess(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scraping Shopify store using direct access");
                return StatusCode(500, new { message = "Failed to scrape products", error = ex.Message });
            }
        }

        // Storefront API access - requires API token
        [HttpPost("shopify/api")]
        public async Task<IActionResult> ScrapeShopifyAPI([FromBody] ShopifyScrapeRequest request)
        {
            try
            {
                _logger.LogInformation($"Starting Storefront API scrape for store: {request.StoreName}");
                return await ScrapeUsingStorefrontAPI(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scraping Shopify store using Storefront API");
                return StatusCode(500, new { message = "Failed to scrape products", error = ex.Message });
            }
        }

        private async Task<IActionResult> ScrapeUsingDirectAccess(ShopifyScrapeRequest request)
        {
            var client = _httpClientFactory.CreateClient();
            var baseUrl = $"https://{request.StoreName}.myshopify.com";
            
            // First, get the total number of products
            var countResponse = await client.GetAsync($"{baseUrl}/products/count.json");
            countResponse.EnsureSuccessStatusCode();
            var countJson = await countResponse.Content.ReadAsStringAsync();
            var countData = JsonSerializer.Deserialize<JsonElement>(countJson);
            var totalProducts = countData.GetProperty("count").GetInt32();

            _logger.LogInformation($"Found {totalProducts} products");

            // Get all products (Shopify allows up to 250 products per page)
            var products = new List<ScrapedProduct>();
            var page = 1;
            var pageSize = 250;

            while (products.Count < totalProducts)
            {
                var response = await client.GetAsync($"{baseUrl}/products.json?limit={pageSize}&page={page}");
                response.EnsureSuccessStatusCode();
                
                var json = await response.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<JsonElement>(json);
                var productsArray = data.GetProperty("products");

                foreach (var product in productsArray.EnumerateArray())
                {
                    var variants = product.GetProperty("variants").EnumerateArray().First();
                    
                    var scrapedProduct = new ScrapedProduct
                    {
                        Name = product.GetProperty("title").GetString() ?? string.Empty,
                        Description = product.GetProperty("body_html").GetString() ?? string.Empty,
                        Price = variants.GetProperty("price").GetDecimal(),
                        DiscountedPrice = variants.TryGetProperty("compare_at_price", out var compareAtPrice) 
                            ? compareAtPrice.GetDecimal() 
                            : null,
                        ImageURL = product.GetProperty("images").EnumerateArray().FirstOrDefault().GetProperty("src").GetString() ?? string.Empty,
                        Color = GetOptionValue(product, "Color"),
                        Size = GetOptionValue(product, "Size"),
                        Material = GetOptionValue(product, "Material"),
                        ProductURL = $"{baseUrl}/products/{product.GetProperty("handle").GetString()}",
                        IsEditorsPick = false,
                        CategoryId = null,
                        SubCategoryId = null,
                        BrandId = null
                    };

                    products.Add(scrapedProduct);
                }

                page++;
            }

            _logger.LogInformation($"Successfully scraped {products.Count} products using direct access");
            return Ok(products);
        }

        private async Task<IActionResult> ScrapeUsingStorefrontAPI(ShopifyScrapeRequest request)
        {
            try
            {
                _logger.LogInformation($"Starting Admin API scrape for store: {request.StoreName}");
                
                var client = _httpClientFactory.CreateClient();
                var baseUrl = $"https://{request.StoreName}.myshopify.com/admin/api/2024-01/products.json";
                
                _logger.LogInformation($"Using Admin API endpoint: {baseUrl}");
                
                if (string.IsNullOrEmpty(request.StorefrontAccessToken))
                {
                    _logger.LogError("Admin API access token is missing");
                    return BadRequest(new { message = "Admin API access token is required" });
                }
                
                client.DefaultRequestHeaders.Add("X-Shopify-Access-Token", request.StorefrontAccessToken);
                _logger.LogInformation("Making request to Shopify Admin API...");
                
                var response = await client.GetAsync(baseUrl);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Shopify API returned error: {response.StatusCode} - {errorContent}");
                    return StatusCode((int)response.StatusCode, new { message = "Shopify API request failed", error = errorContent });
                }
                
                var json = await response.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<JsonElement>(json);
                
                if (!data.TryGetProperty("products", out var productsElement))
                {
                    _logger.LogError("Invalid response format from Shopify API");
                    return StatusCode(500, new { message = "Invalid response format from Shopify API" });
                }
                
                var products = new List<ScrapedProduct>();
                
                foreach (var product in productsElement.EnumerateArray())
                {
                    var variant = product.GetProperty("variants").EnumerateArray().First();
                    var image = product.GetProperty("images").EnumerateArray().FirstOrDefault();
                    
                    var scrapedProduct = new ScrapedProduct
                    {
                        Name = product.GetProperty("title").GetString() ?? string.Empty,
                        Description = product.GetProperty("body_html").GetString() ?? string.Empty,
                        Price = decimal.Parse(variant.GetProperty("price").GetString() ?? "0"),
                        DiscountedPrice = variant.TryGetProperty("compare_at_price", out var compareAtPrice) 
                            ? decimal.Parse(compareAtPrice.GetString() ?? "0")
                            : null,
                        ImageURL = image.GetProperty("src").GetString() ?? string.Empty,
                        Color = GetOptionValue(product, "Color"),
                        Size = GetOptionValue(product, "Size"),
                        Material = GetOptionValue(product, "Material"),
                        ProductURL = $"https://{request.StoreName}.myshopify.com/products/{product.GetProperty("handle").GetString()}",
                        IsEditorsPick = false,
                        CategoryId = null,
                        SubCategoryId = null,
                        BrandId = null
                    };

                    products.Add(scrapedProduct);
                }

                _logger.LogInformation($"Successfully scraped {products.Count} products using Admin API");
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ScrapeUsingStorefrontAPI");
                return StatusCode(500, new { message = "Failed to scrape products using Admin API", error = ex.Message });
            }
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveProducts([FromBody] SaveProductsRequest request)
        {
            try
            {
                _logger.LogInformation($"Saving {request.Products.Count} products");

                foreach (var product in request.Products)
                {
                    // Check if brand exists, if not create it
                    var brandName = ExtractBrandName(product.Name);
                    var brand = await _context.Brands
                        .FirstOrDefaultAsync(b => b.Name == brandName);

                    if (brand == null)
                    {
                        brand = new Brand
                        {
                            Name = brandName,
                            WebsiteURL = new Uri(product.ProductURL).Host
                        };
                        _context.Brands.Add(brand);
                        await _context.SaveChangesAsync();
                    }

                    // Create or update product
                    var existingProduct = await _context.Products
                        .FirstOrDefaultAsync(p => p.ProductURL == product.ProductURL);

                    if (existingProduct == null)
                    {
                        var newProduct = new Product
                        {
                            Name = product.Name,
                            Description = product.Description,
                            Price = product.Price,
                            DiscountedPrice = product.DiscountedPrice,
                            ImageURL = product.ImageURL,
                            Color = product.Color,
                            Size = product.Size,
                            Material = product.Material,
                            ProductURL = product.ProductURL,
                            IsEditorsPick = product.IsEditorsPick,
                            BrandID = brand.ID,
                            CategoryID = product.CategoryId ?? 0, // Default to 0 if null
                            SubCategoryID = product.SubCategoryId ?? 0, // Default to 0 if null
                            AddedAt = DateTime.UtcNow
                        };
                        _context.Products.Add(newProduct);
                    }
                    else
                    {
                        existingProduct.Name = product.Name;
                        existingProduct.Description = product.Description;
                        existingProduct.Price = product.Price;
                        existingProduct.DiscountedPrice = product.DiscountedPrice;
                        existingProduct.ImageURL = product.ImageURL;
                        existingProduct.Color = product.Color;
                        existingProduct.Size = product.Size;
                        existingProduct.Material = product.Material;
                        existingProduct.IsEditorsPick = product.IsEditorsPick;
                        existingProduct.CategoryID = product.CategoryId ?? 0; // Default to 0 if null
                        existingProduct.SubCategoryID = product.SubCategoryId ?? 0; // Default to 0 if null
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Products saved successfully");
                return Ok(new { message = "Products saved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving products");
                return StatusCode(500, new { message = "Failed to save products", error = ex.Message });
            }
        }

        private string? GetOptionValue(JsonElement product, string optionName)
        {
            try
            {
                var options = product.GetProperty("options");
                foreach (var option in options.EnumerateArray())
                {
                    if (option.GetProperty("name").GetString() == optionName)
                    {
                        return option.GetProperty("values").EnumerateArray().FirstOrDefault().GetString();
                    }
                }
                return null;
            }
            catch
            {
                return null;
            }
        }

        private string ExtractBrandName(string productName)
        {
            // Simple brand extraction - you might want to improve this
            var parts = productName.Split(new[] { ' ', '-', '|' }, StringSplitOptions.RemoveEmptyEntries);
            return parts.Length > 0 ? parts[0] : "Unknown Brand";
        }
    }

    public class ShopifyScrapeRequest
    {
        public string StoreName { get; set; } = string.Empty;
        public string? StorefrontAccessToken { get; set; }
    }

    public class SaveProductsRequest
    {
        public List<ScrapedProduct> Products { get; set; } = new();
    }

    public class ScrapedProduct
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public string ImageURL { get; set; } = string.Empty;
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Material { get; set; }
        public string ProductURL { get; set; } = string.Empty;
        public bool IsEditorsPick { get; set; }
        public int? CategoryId { get; set; }
        public int? SubCategoryId { get; set; }
        public int? BrandId { get; set; }
    }
} 