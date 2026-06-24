using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Routing.Constraints;

namespace Backend.DTOs
{
    public class UserEditVM
    {
        public string? Username {get;set;}
        public string? Email {get;set;}
        public string? Bio{get;set;}
        public IFormFile? ProfilePictureFile {get;set;}
    }
}