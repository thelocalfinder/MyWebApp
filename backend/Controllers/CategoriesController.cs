using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using MyWebApp.Models;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MyWebApp.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(ApplicationDbContext context, ILogger<CategoriesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] string? gender = null)
        {
            try
            {
                _logger.LogInformation($"Fetching categories for gender: {gender ?? "all"}");
                
                IQueryable<Category> baseQuery = _context.Categories;

                if (!string.IsNullOrEmpty(gender))
                {
                    // If gender is specified, get categories for that gender AND unisex categories (where Gender is null)
                    baseQuery = baseQuery.Where(c => c.Gender == gender || c.Gender == null);
                }

                var categories = await baseQuery
                    .Include(c => c.SubCategories)
                    .ToListAsync();

                _logger.LogInformation($"Found {categories.Count} categories");
                
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching categories");
                return StatusCode(500, new { error = "An error occurred while fetching categories" });
            }
        }

        [HttpGet("{id}/subcategories")]
        public async Task<IActionResult> GetSubCategories(int id)
        {
            try
            {
                _logger.LogInformation($"Fetching subcategories for category ID: {id}");
                
                var subcategories = await _context.SubCategories
                    .Where(sc => sc.CategoryID == id)
                    .ToListAsync();

                _logger.LogInformation($"Found {subcategories.Count} subcategories for category ID: {id}");
                
                return Ok(subcategories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching subcategories for category ID: {id}");
                return StatusCode(500, new { error = "An error occurred while fetching subcategories" });
            }
        }
    }
}
