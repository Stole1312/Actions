using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class ChangePasswordDto
    {
        public required string VerificationCode { get; set; }
        public required string NewPassword { get; set; }
    }
}