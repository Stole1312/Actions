using System;
namespace Backend.Models
{
    public class Chat
    {
        [Key]
        public int ID { get; set; }
        public string Name { get; set; }
        public bool IsPrivate { get; set; }
        public bool AdminTextOnly { get; set; }

        public ICollection<ChatParticipant> Participants { get; set; }
        public ICollection<Message> Messages { get; set; }
    }
}