using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public MedicalRecordsController(AppDbContext db)
        {
            _db = db;
        }

        // GET api/medicalrecords
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var records = await _db.MedicalRecords
                .Include(r => r.Pet)
                .Include(r => r.Veterinarian)
                .ToListAsync();

            return Ok(records);
        }

        // GET api/medicalrecords/pet/1  → all records for a specific pet
        [HttpGet("pet/{petId}")]
        public async Task<IActionResult> GetByPet(int petId)
        {
            var records = await _db.MedicalRecords
                .Include(r => r.Pet)
                .Include(r => r.Veterinarian)
                .Where(r => r.PetId == petId)
                .ToListAsync();

            return Ok(records);
        }

        // GET api/medicalrecords/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var record = await _db.MedicalRecords
                .Include(r => r.Pet)
                .Include(r => r.Veterinarian)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (record == null) return NotFound();
            return Ok(record);
        }

        // POST api/medicalrecords
        [HttpPost]
        public async Task<IActionResult> Create(MedicalRecord record)
        {
            _db.MedicalRecords.Add(record);

            // automatically set the pet status to Done
            var petStatus = await _db.PetStatuses.FirstOrDefaultAsync(ps => ps.PetId == record.PetId);
            if (petStatus != null)
            {
                petStatus.Status    = "Done";
                petStatus.UpdatedAt = DateTime.Now;
            }

            await _db.SaveChangesAsync();
            return Ok(record);
        }

        // PUT api/medicalrecords/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MedicalRecord updated)
        {
            var record = await _db.MedicalRecords.FindAsync(id);
            if (record == null) return NotFound();

            record.Symptoms         = updated.Symptoms;
            record.Diagnosis        = updated.Diagnosis;
            record.Treatment        = updated.Treatment;
            record.Medicine         = updated.Medicine;
            record.Notes            = updated.Notes;
            record.ExaminationDate  = updated.ExaminationDate;

            await _db.SaveChangesAsync();
            return Ok(record);
        }

        // DELETE api/medicalrecords/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var record = await _db.MedicalRecords.FindAsync(id);
            if (record == null) return NotFound();

            _db.MedicalRecords.Remove(record);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Record deleted" });
        }
    }
}