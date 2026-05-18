using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PetTypesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PetTypesController(AppDbContext db)
        {
            _db = db;
        }

        // GET api/pettypes
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var types = await _db.PetTypes.ToListAsync();
            return Ok(types);
        }
    }
}