namespace Backend.Models
{
    public class UserNotification
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey(nameof(User))]
        public int UserID { get; set; }

        public required string Title { get; set; }

        public required string Message { get; set; }

        public NotificationType Type { get; set; }

        public UserRequestStatus? ReportStatus { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime Created { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
    }
}