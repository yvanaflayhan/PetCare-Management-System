using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Attendance")]
    public class Attendance
    {
        [Key]
        public int Id { get; set; }

        public int VetId { get; set; }

        public DateTime AttendanceDate { get; set; }

        public bool IsPresent { get; set; } = false;

        [MaxLength(255)]
        public string? Notes { get; set; }

        [ForeignKey("VetId")]
        public Veterinarian? Veterinarian { get; set; }
    }
}