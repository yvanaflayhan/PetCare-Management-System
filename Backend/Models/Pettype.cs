using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("PetTypes")]
    public class PetType
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string TypeName { get; set; } = string.Empty;

        public ICollection<Pet> Pets { get; set; } = new List<Pet>();
        public ICollection<VetAnimalExpertise> VetAnimalExpertises { get; set; } = new List<VetAnimalExpertise>();
    }
}