using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class UserViewModel
    {
        public int ID {get;set;}
        public required string Username {get;set;}
        public required string Email {get;set;}
        public UserRoles Role {get;set;}
        public string? Bio{get;set;}
        public VerifiedStatus VerificationStatus {get;set;}
        public bool isBanned {get;set;}=false;
        public DateTime Created {get;set;}=DateTime.UtcNow;
        public string? ProfilePicture {get;set;}
    }
}