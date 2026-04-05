using System;

namespace App.Models
{
    public class Report
    {
        public int SenderID { get; set; }
        public int ReciverID { get; set; }
        public ReportReason Reason { get; set; }
        public required string Description { get; set; }
        public DateTime Created { get; set; }
        public UserRequestStatus Status { get; set; }

        public User Sender { get; set; }
        public User Reciver { get; set; }
    }
}