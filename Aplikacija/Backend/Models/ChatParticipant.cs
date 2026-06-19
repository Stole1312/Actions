using System;

namespace Backend.Models
{
    public class ChatParticipant
    {
        [Key]
        public int ID { get; set; }
        public int UserID { get; set; }
        public int ChatID { get; set; }
        public bool IsAdmin { get; set; }

        public DateTime? LastReadAt { get; set; }

        //Navigation property
        public User User { get; set; } = null!;
        public Chat Chat { get; set; } = null!;
    }
}