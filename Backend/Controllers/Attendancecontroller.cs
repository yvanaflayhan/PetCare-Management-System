using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AttendanceController(AppDbContext db)
        {
            _db = db;
        }

        // GET api/attendance/today
        [HttpGet("today")]
        public async Task<IActionResult> GetToday()
        {
            var today = DateTime.Today;

            var records = await _db.Attendances
                .Include(a => a.Veterinarian)
                .Where(a => a.AttendanceDate == today)
                .ToListAsync();

            return Ok(records);
        }

        // GET api/attendance/month/2026/5  → for salary calculation
        [HttpGet("month/{year}/{month}")]
        public async Task<IActionResult> GetByMonth(int year, int month)
        {
            var records = await _db.Attendances
                .Include(a => a.Veterinarian)
                .Where(a => a.AttendanceDate.Year == year &&
                            a.AttendanceDate.Month == month)
                .ToListAsync();

            // group by vet and count days present
            var summary = records
                .GroupBy(a => a.Veterinarian!.Name)
                .Select(g => new
                {
                    VetName     = g.Key,
                    DaysPresent = g.Count(a => a.IsPresent),
                    DaysAbsent  = g.Count(a => !a.IsPresent)
                })
                .ToList();

            return Ok(summary);
        }

        // POST api/attendance/save  → saves the whole day at once
        // Body: [{ "vetId": 1, "isPresent": true }, ...]
        [HttpPost("save")]
        public async Task<IActionResult> SaveToday(List<AttendanceEntry> entries)
        {
            var today = DateTime.Today;

            foreach (var entry in entries)
            {
                var existing = await _db.Attendances
                    .FirstOrDefaultAsync(a => a.VetId == entry.VetId && a.AttendanceDate == today);

                if (existing != null)
                {
                    existing.IsPresent = entry.IsPresent;
                }
                else
                {
                    _db.Attendances.Add(new Attendance
                    {
                        VetId          = entry.VetId,
                        AttendanceDate = today,
                        IsPresent      = entry.IsPresent
                    });
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Attendance saved", date = today });
        }
    }

    public class AttendanceEntry
    {
        public int  VetId     { get; set; }
        public bool IsPresent { get; set; }
    }
}