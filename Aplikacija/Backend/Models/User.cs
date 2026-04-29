using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class User
    {
        [Key]
        public int ID {get;set;}
        public required string Username {get;set;}
        public required string Email {get;set;}
        public required string Password{get;set;}
        public UserRoles Role {get;set;}
        public string? Bio{get;set;}
        public VerifiedStatus VerificationStatus {get;set;}
        [DefaultValue(false)]
        public bool isBanned {get;set;}=false;
        public DateTime Created {get;set;}=DateTime.UtcNow;
        public string? ProfilePicture {get;set;}
    }
}

/*
- ID: int 
- Username: string
- Email: string
- Password: string
- Role: enum
- Bio: string
- VerifiedStatus: enum
- isBanned: bool
- Created: datetime
- ProfilePic: string
*/