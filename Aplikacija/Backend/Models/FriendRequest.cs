using System;

namespace Backend.Models
{
    public class FriendRequest
    {
        [Key]
        public int ID { get; set; }
        public int  InitiatorID { get; set; }
        public int ReciverID { get; set; }
        public UserRequestStatus Status { get; set; }
        public DateTime Created { get; set; }
        // Navigation properties
        public User Initiator { get; set; }
        public User Reciver { get; set; }
    }
}