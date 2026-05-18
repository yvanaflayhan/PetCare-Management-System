using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Pets")]
    public class Pet
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public int TypeId { get; set; }

        [MaxLength(100)]
        public string? Breed { get; set; }

        public int? Age { get; set; }

        public bool IsActive { get; set; } = true;

        public int? OwnerId { get; set; }

        // Navigation
        [ForeignKey("TypeId")]
        public PetType? PetType { get; set; }

        [ForeignKey("OwnerId")]
        public Owner? Owner { get; set; }

        public PetStatus? PetStatus { get; set; }
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<MedicalCase> MedicalCases { get; set; } = new List<MedicalCase>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
        public ICollection<PetStay> PetStays { get; set; } = new List<PetStay>();
    }
}