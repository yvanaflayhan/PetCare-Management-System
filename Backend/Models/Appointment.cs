using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Appointments")]
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        public int? PetId { get; set; }

        public int? VetId { get; set; }

        [Column("Date")]
        public DateTime? Date { get; set; }

        [MaxLength(255)]
        public string? Reason { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Scheduled";

        // Navigation
        [ForeignKey("PetId")]
        public Pet? Pet { get; set; }

        [ForeignKey("VetId")]
        public Veterinarian? Veterinarian { get; set; }
    }
}
