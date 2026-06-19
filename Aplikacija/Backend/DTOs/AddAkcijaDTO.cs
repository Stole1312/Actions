using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class AddAkcijaDTO
    {
        public required string Title {get;set;}
        public required string Description {get;set;}
        public required string Location{get;set;}
        public required IFormFile ActionPicture{get;set;}
        public ActionTypes Type {get;set;}
        public DateTime DTStart{get;set;}
        public DateTime DTEnd{get;set;}
        public int maxParticipants {get;set;}
        public decimal? Price {get;set;} 
        public DateTime Created{get;set;}
    }
}