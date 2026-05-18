using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("PetStays")]
    public class PetStay
    {
        [Key]
        public int Id { get; set; }

        public int PetId { get; set; }

        public DateTime CheckInDate { get; set; }

        public DateTime? CheckOutDate { get; set; }

        [MaxLength(255)]
        public string? Reason { get; set; }

        public string? Notes { get; set; }

        public bool IsActive { get; set; } = true;

        [ForeignKey("PetId")]
        public Pet? Pet { get; set; }
    }
}