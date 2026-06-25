using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class VerificationCode
    {
        [Key]
        public int ID { get; set; }
        public string Email { get; set; }
        public string Code { get; set; }
        public DateTime ExpiresAt { get; set; } 
    }
}