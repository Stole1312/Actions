using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class EditAkcijaDTO
    {
        public string? Title {get;set;}
        public string? Description {get;set;}
        public string? Location{get;set;}
        public IFormFile? ActionPicture {get;set;}
        public ActionTypes? Type {get;set;}
        public DateTime? DateAndTime{get;set;}
        public int? maxParticipants {get;set;}
        public decimal? Price {get;set;}
    }
}