using System;

namespace App.Models
{
    public class FriendRequest
    {
        public int ID { get; set; }
        public int SenderID { get; set; }
        public int ReciverID { get; set; }
        public UserRequestStatus Status { get; set; }
        public DateTime Created { get; set; }
        // Navigation properties
        public User Sender { get; set; }
        public User Reciver { get; set; }
    }
}