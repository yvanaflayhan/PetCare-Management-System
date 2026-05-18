using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("VetDetails")]
    public class VetDetails
    {
        [Key]
        public int Id { get; set; }

        public int VetId { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        public bool IsAvailable { get; set; } = true;

        [ForeignKey("VetId")]
        public Veterinarian? Veterinarian { get; set; }
    }
}
