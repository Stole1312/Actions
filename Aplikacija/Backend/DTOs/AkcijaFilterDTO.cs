using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class AkcijaFilterDTO
    {
        public string? Title {get;set;}
        public double Latitude { get; set; }
        public double Longitude { get; set; } 
        public required int Distance{get;set;}
        public ActionTypes? Type {get;set;}
        public DateTime? OdKada{get;set;}
        public DateTime? DoKada{get;set;}
        public ActionStatus? Status{get;set;}
        public bool? CheapestFirst {get;set;} 
    }
}