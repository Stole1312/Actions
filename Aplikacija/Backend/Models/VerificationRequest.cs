using System;

namespace Backend.Models
{
    public class VerificationRequest
    {
        [Key]
        public int ID{get;set;}
        public int InitiatorID { get; set; }
        public int ReviewerID { get; set; }
        public string Document{get;set;}
        public DateTime Created { get; set; }
        public UserRequestStatus Status{get;set;}
        // Navigation properties
        public User Sender { get; set; }
        public User Reviewer { get; set; }
    }
}