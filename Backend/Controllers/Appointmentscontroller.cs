using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AppointmentsController(AppDbContext db)
        {
            _db = db;
        }

        // GET api/appointments
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var appointments = await _db
                .Appointments.Include(a => a.Pet)
                .Include(a => a.Veterinarian)
                .ToListAsync();

            return Ok(appointments);
        }

        // GET api/appointments/today
        [HttpGet("today")]
        public async Task<IActionResult> GetToday()
        {
            var today = DateTime.Now.Date;

            var appointments = await _db
                .Appointments.Include(a => a.Pet)
                .Include(a => a.Veterinarian)
                .Where(a => a.Date.HasValue && a.Date.Value.Date == today)
                .ToListAsync();
            return Ok(appointments);
        }

        // GET api/appointments/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var appt = await _db
                .Appointments.Include(a => a.Pet)
                .Include(a => a.Veterinarian)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appt == null)
                return NotFound();
            return Ok(appt);
        }

        // POST api/appointments
        [HttpPost]
        public async Task<IActionResult> Create(Appointment appt)
        {
            _db.Appointments.Add(appt);
            await _db.SaveChangesAsync();
            return Ok(appt);
        }

        // PUT api/appointments/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Appointment updated)
        {
            var appt = await _db.Appointments.FindAsync(id);
            if (appt == null)
                return NotFound();

            appt.PetId = updated.PetId;
            appt.VetId = updated.VetId;
            appt.Date = updated.Date;
            appt.Reason = updated.Reason;
            appt.Status = updated.Status;

            await _db.SaveChangesAsync();
            return Ok(appt);
        }

        // DELETE api/appointments/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var appt = await _db.Appointments.FindAsync(id);
            if (appt == null)
                return NotFound();

            _db.Appointments.Remove(appt);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Appointment deleted" });
        }
    }
}
