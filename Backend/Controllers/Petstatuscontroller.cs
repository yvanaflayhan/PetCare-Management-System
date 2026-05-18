using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PetStatusController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PetStatusController(AppDbContext db)
        {
            _db = db;
        }

        // GET api/petstatus
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var statuses = await _db
                .PetStatuses.Include(ps => ps.Pet)
                .Include(ps => ps.AssignedVet)
                .ToListAsync();

            return Ok(statuses);
        }

        // PUT api/petstatus/1  → update status of a pet
        [HttpPut("{petId}")]
        public async Task<IActionResult> UpdateStatus(int petId, PetStatus updated)
        {
            var status = await _db.PetStatuses.FirstOrDefaultAsync(ps => ps.PetId == petId);

            if (status == null)
            {
                // create it if it doesn't exist yet
                updated.PetId = petId;
                updated.UpdatedAt = DateTime.Now;
                _db.PetStatuses.Add(updated);
            }
            else
            {
                status.Status = updated.Status;
                status.AssignedVetId = updated.AssignedVetId;
                status.UpdatedAt = DateTime.Now;
            }

            await _db.SaveChangesAsync();
            return Ok(
                new
                {
                    message = "Status updated",
                    petId,
                    status = updated.Status,
                }
            );
        }
    }
}
