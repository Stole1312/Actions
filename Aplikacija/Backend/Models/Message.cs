using System;
namespace Backend.Models
{
    public class Message
    {
        [Key]
        public int ID { get; set; }
        public int ChatID { get; set; }
        public int SenderID { get; set; }
        public string Content { get; set; } = null!;
        public DateTime Sent { get; set; }
        public Chat Chat { get; set; } = null!;
        public User Sender { get; set; } = null!;
    }
}
