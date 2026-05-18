using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("PetStatus")]
    public class PetStatus
    {
        [Key]
        public int Id { get; set; }

        public int PetId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Waiting";

        public int? AssignedVetId { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("PetId")]
        public Pet? Pet { get; set; }

        [ForeignKey("AssignedVetId")]
        public Veterinarian? AssignedVet { get; set; }
    }
}