using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Routing.Constraints;

namespace Backend.DTOs
{
    public class UserRegisterVM
    {
        public int ID {get;set;}
        public required string Username {get;set;}
        public required string Password{get;set;}
        public required string Email {get;set;}
        public UserRoles Role {get;set;}
        public string? Bio{get;set;}
        public VerifiedStatus VerificationStatus {get;set;}
        public bool isBanned {get;set;}=false;
        public DateTime Created {get;set;}=DateTime.UtcNow;
        public IFormFile? ProfilePictureFile {get;set;}
    }
}