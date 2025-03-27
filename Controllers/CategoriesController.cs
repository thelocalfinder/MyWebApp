using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApp.Data;
using MyWebApp.Models;
using System.Threading.Tasks;

namespace MyWebApp.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
             var categories = await _context.Categories
             .Include(c => c.SubCategories)  // Ensure SubCategories are fetched
             .ToListAsync();
            return Ok(categories);
        }
    }
}
