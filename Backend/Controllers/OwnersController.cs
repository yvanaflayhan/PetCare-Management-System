using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OwnersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public OwnersController(AppDbContext db)
        {
            _db = db;
        }

        // GET api/owners
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var owners = await _db.Owners.ToListAsync();
            return Ok(owners);
        }

        // GET api/owners/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var owner = await _db.Owners
                .Include(o => o.Pets)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (owner == null) return NotFound();
            return Ok(owner);
        }

        // POST api/owners
        [HttpPost]
        public async Task<IActionResult> Create(Owner owner)
        {
            _db.Owners.Add(owner);
            await _db.SaveChangesAsync();
            return Ok(owner);
        }

        // PUT api/owners/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Owner updated)
        {
            var owner = await _db.Owners.FindAsync(id);
            if (owner == null) return NotFound();

            owner.Name  = updated.Name;
            owner.Phone = updated.Phone;
            owner.Email = updated.Email;

            await _db.SaveChangesAsync();
            return Ok(owner);
        }

        // DELETE api/owners/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var owner = await _db.Owners.FindAsync(id);
            if (owner == null) return NotFound();

            _db.Owners.Remove(owner);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Owner deleted" });
        }
    }
}