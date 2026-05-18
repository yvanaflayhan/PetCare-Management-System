using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("MedicalRecords")]
    public class MedicalRecord
    {
        [Key]
        public int Id { get; set; }

        public int PetId { get; set; }

        public int? VetId { get; set; }

        public int? AppointmentId { get; set; }

        public DateTime ExaminationDate { get; set; }

        public string? Symptoms { get; set; }

        [MaxLength(255)]
        public string? Diagnosis { get; set; }

        public string? Treatment { get; set; }

        [MaxLength(255)]
        public string? Medicine { get; set; }

        public string? Notes { get; set; }

        [ForeignKey("PetId")]
        public Pet? Pet { get; set; }

        [ForeignKey("VetId")]
        public Veterinarian? Veterinarian { get; set; }

        [ForeignKey("AppointmentId")]
        public Appointment? Appointment { get; set; }
    }
}