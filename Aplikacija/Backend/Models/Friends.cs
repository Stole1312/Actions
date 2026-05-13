using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection.Metadata;

namespace Backend.Models
{
    public class Friends
    {
        [Key]
        public int ID { get; set; }
        public int InitiatorID { get; set; }
        public int ReceiverID { get; set; }

        [ForeignKey(nameof(InitiatorID))]
        public User Initiator { get; set; } = null!;

        [ForeignKey(nameof(ReceiverID))]
        public User Receiver { get; set; } = null!;
        
        public DateTime FriendsSince { get; set; } = DateTime.UtcNow;
    }
}