using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class EditAkcijaDTO
    {
        public string? Title {get;set;}
        public string? Description {get;set;}
        public string? Location{get;set;}

        public double? Latitude{get;set;}
        public double? Longitude{get;set;}
        public IFormFile? ActionPicture {get;set;}
        public ActionTypes? Type {get;set;}
        public DateTime? DTStart{get;set;}
        public DateTime? DTEnd{get;set;}
        public int? maxParticipants {get;set;}
        public decimal? Price {get;set;}
    }
}