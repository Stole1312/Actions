using System.ComponentModel.DataAnnotations;
using System.Reflection.Metadata;

namespace Backend.Models
{
    public class Friends
    {
        public int InitiatorID { get; set; }
        public int ReceiverID { get; set; }
        public User Initiator { get; set; }
        public User Reciver { get; set; }
        public DateTime FriendsSince { get; set; } = DateTime.UtcNow;
    }
}