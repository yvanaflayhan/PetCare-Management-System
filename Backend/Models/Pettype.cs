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

        // Navigation
        public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    }
}