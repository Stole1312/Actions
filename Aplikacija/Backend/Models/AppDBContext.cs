namespace Backend.Models
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions<AppDBContext> options)
            : base(options)
        {
        }

        // Ovde registruješ svoje modele kao tabele u bazi
        public DbSet<User> Users { get; set; }
        public DbSet<Akcija> Akcije { get; set; }
        public DbSet<Friends> Friends { get; set; }
        public DbSet<FriendRequest> FriendRequests { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<VerificationRequest> VerificationRequests { get; set; }
        public DbSet<DeoAkcije> DeoAkcije { get; set; }
        public DbSet<SlikaSaAkcije> SlikeSaAkcije { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<ChatParticipant> ChatParticipants { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Rating> Ratings { get; set; }
        public DbSet<Follow> Follows { get; set; }
    }
}