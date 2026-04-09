using System;
namespace Backend.Models
{
    public class Chat
    {
        [Key]
        public int ID { get; set; }
        public string Name { get; set; } = null!;
        public bool IsPrivate { get; set; }
        public bool AdminTextOnly { get; set; }

        public ICollection<ChatParticipant> Participants { get; set; } = null!;
        public ICollection<Message> Messages { get; set; } = null!;
    }
}