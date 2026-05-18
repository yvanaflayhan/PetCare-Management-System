using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("VetAnimalExpertise")]
    public class VetAnimalExpertise
    {
        [Key]
        public int Id { get; set; }

        public int VetId { get; set; }

        public int PetTypeId { get; set; }

        [ForeignKey("VetId")]
        public Veterinarian? Veterinarian { get; set; }

        [ForeignKey("PetTypeId")]
        public PetType? PetType { get; set; }
    }
}
