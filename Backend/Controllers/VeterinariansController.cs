using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VeterinariansController : ControllerBase
    {
        private readonly AppDbContext _db;

        public VeterinariansController(AppDbContext db)
        {
            _db = db;
        }

        // GET api/veterinarians
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vets = await _db
                .Veterinarians.Include(v => v.VetDetails)
                .Include(v => v.AnimalExpertises)
                    .ThenInclude(e => e.PetType)
                .ToListAsync();

            return Ok(vets);
        }

        // GET api/veterinarians/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var vet = await _db
                .Veterinarians.Include(v => v.VetDetails)
                .Include(v => v.AnimalExpertises)
                    .ThenInclude(e => e.PetType)
                .Include(v => v.Appointments)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vet == null)
                return NotFound();
            return Ok(vet);
        }

        // POST api/veterinarians
        [HttpPost]
        public async Task<IActionResult> Create(Veterinarian vet)
        {
            _db.Veterinarians.Add(vet);
            await _db.SaveChangesAsync();
            return Ok(vet);
        }

        // PUT api/veterinarians/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Veterinarian updated)
        {
            var vet = await _db.Veterinarians.FindAsync(id);
            if (vet == null)
                return NotFound();

            vet.Name = updated.Name;
            vet.Role = updated.Role;
            vet.Specialization = updated.Specialization;
            vet.University = updated.University;
            vet.GraduationYear = updated.GraduationYear;

            await _db.SaveChangesAsync();
            return Ok(vet);
        }

        // DELETE api/veterinarians/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var vet = await _db.Veterinarians.FindAsync(id);
            if (vet == null)
                return NotFound();

            _db.Veterinarians.Remove(vet);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Veterinarian deleted" });
        }
    }
}
