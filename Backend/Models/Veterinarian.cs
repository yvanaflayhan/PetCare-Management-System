using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Veterinarians")]
    public class Veterinarian
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Specialization { get; set; }

        [MaxLength(150)]
        public string? University { get; set; }

        public int? GraduationYear { get; set; }

        public VetDetails? VetDetails { get; set; }
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
        public ICollection<VetAnimalExpertise> AnimalExpertises { get; set; } = new List<VetAnimalExpertise>();
        public ICollection<PetStatus> AssignedPetStatuses { get; set; } = new List<PetStatus>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();

    }
}