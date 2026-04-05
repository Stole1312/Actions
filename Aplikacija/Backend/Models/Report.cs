using System;

namespace Backend.Models
{
    public class Report
    {
        [Key]
        public int ID{get;set;}
        public int InitiatorID { get; set; }
        public int ReciverID { get; set; }
        public ReportReason Reason { get; set; }
        public required string Description { get; set; }
        public DateTime Created { get; set; }
        public UserRequestStatus Status { get; set; }
        public User Sender { get; set; }
        public User Reciver { get; set; }
    }
}