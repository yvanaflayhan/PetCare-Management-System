using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("MedicalCases")]
    public class MedicalCase
    {
        [Key]
        public int Id { get; set; }

        public int? PetId { get; set; }

        [MaxLength(100)]
        public string? DiseaseName { get; set; }

        public string? Description { get; set; }

        public string? Treatment { get; set; }

        public DateTime? DateDiagnosed { get; set; }

        [ForeignKey("PetId")]
        public Pet? Pet { get; set; }
    }
}