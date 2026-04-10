using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Friends
    {
        [Key]
        public int ID { get; set; }
<<<<<<< HEAD

        public int InitiatorID { get; set; }
        public int ReceiverID { get; set; }

        public User Initiator { get; set; } = null!;
        public User Receiver { get; set; } = null!;

=======
        public int InitiatorID { get; set; }
        public int ReceiverID { get; set; }
        public User Initiator { get; set; } = null!;
        public User Reciver { get; set; } = null!;
>>>>>>> dev
        public DateTime FriendsSince { get; set; } = DateTime.UtcNow;
    }
}