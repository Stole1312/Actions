using System;
using System.Security.Authentication;
namespace Backend.Models
{
    public class Chat
    {
        [Key]
        public int ID { get; set; }
        public string Name { get; set; } = null!;
        public bool AdminTextOnly { get; set; }
        public required ChatType Type { get; set; }
        public int? AkcijaID { get; set; }

        public ICollection<ChatParticipant> Participants { get; set; } = null!;
        public ICollection<Message> Messages { get; set; } = null!;
    }
}