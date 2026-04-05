using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Ovde registruješ svoje modele kao tabele u bazi
        public DbSet<User> Users { get; set; }
        public DbSet<Action> Actions { get; set; }
        public DbSet<Friends> Friends { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // KLJUČNO: Podešavanje za Friends tabelu (Composite Key)
            modelBuilder.Entity<Friends>()
                .HasKey(f => new { f.InitiatorID, f.ReceiverID });

            // Povezivanje sa User tabelom (ko je poslao, ko primio)
            modelBuilder.Entity<Friends>()
                .HasOne(f => f.Initiator)
                .WithMany()
                .HasForeignKey(f => f.InitiatorID)
                .OnDelete(DeleteBehavior.Restrict); // Da se ne obriše user ako obrišeš prijateljstvo

            modelBuilder.Entity<Friends>()
                .HasOne(f => f.Receiver)
                .WithMany()
                .HasForeignKey(f => f.ReceiverID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}