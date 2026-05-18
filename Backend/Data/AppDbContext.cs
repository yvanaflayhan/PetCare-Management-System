using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Owner> Owners { get; set; }
        public DbSet<PetType> PetTypes { get; set; }
        public DbSet<Pet> Pets { get; set; }
        public DbSet<Veterinarian> Veterinarians { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<MedicalCase> MedicalCases { get; set; }
        public DbSet<PetStatus> PetStatuses { get; set; }
        public DbSet<PetStay> PetStays { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<VetDetails> VetDetails { get; set; }
        public DbSet<VetAnimalExpertise> VetAnimalExpertises { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // PetStatus: one pet has one status
            modelBuilder.Entity<PetStatus>().HasIndex(ps => ps.PetId).IsUnique();

            // VetDetails: one vet has one details row
            modelBuilder.Entity<VetDetails>().HasIndex(vd => vd.VetId).IsUnique();

            // Attendance: one vet can only have one record per day
            modelBuilder
                .Entity<Attendance>()
                .HasIndex(a => new { a.VetId, a.AttendanceDate })
                .IsUnique();

            // VetAnimalExpertise: one vet + one type = unique pair
            modelBuilder
                .Entity<VetAnimalExpertise>()
                .HasIndex(v => new { v.VetId, v.PetTypeId })
                .IsUnique();
        }
    }
}
