using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PetsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PetsController(AppDbContext db)
        {
            _db = db;
        }

        // GET api/pets
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var pets = await _db.Pets
                .Include(p => p.Owner)
                .Include(p => p.PetType)
                .Include(p => p.PetStatus)
                .ToListAsync();

            return Ok(pets);
        }

        // GET api/pets/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pet = await _db.Pets
                .Include(p => p.Owner)
                .Include(p => p.PetType)
                .Include(p => p.PetStatus)
                .Include(p => p.MedicalRecords)
                .Include(p => p.Appointments)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pet == null) return NotFound();
            return Ok(pet);
        }

        // POST api/pets
        [HttpPost]
        public async Task<IActionResult> Create(Pet pet)
        {
            _db.Pets.Add(pet);
            await _db.SaveChangesAsync();
            return Ok(pet);
        }

        // PUT api/pets/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Pet updated)
        {
            var pet = await _db.Pets.FindAsync(id);
            if (pet == null) return NotFound();

            pet.Name     = updated.Name;
            pet.TypeId   = updated.TypeId;
            pet.Breed    = updated.Breed;
            pet.Age      = updated.Age;
            pet.IsActive = updated.IsActive;
            pet.OwnerId  = updated.OwnerId;

            await _db.SaveChangesAsync();
            return Ok(pet);
        }

        // DELETE api/pets/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var pet = await _db.Pets.FindAsync(id);
            if (pet == null) return NotFound();

            _db.Pets.Remove(pet);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Pet deleted" });
        }
    }
}