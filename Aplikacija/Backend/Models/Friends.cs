using System.ComponentModel.DataAnnotations;
using System.Reflection.Metadata;

namespace Backend.Models
{
    public class Friends
    {
        [Key]
        public int InitiatorID {get;set;}
        public int ReceiverID {get;set;}
        public User Initiator{get;set;} = null!;
        public User Reciver {get;set;} = null!;
        public DateTime FriendsSince {get;set;}=DateTime.UtcNow;
    }
}