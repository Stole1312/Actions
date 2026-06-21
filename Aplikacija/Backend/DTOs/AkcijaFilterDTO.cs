using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class AkcijaFilterDTO
    {
        public string? Title {get;set;}//
        public double Latitude { get; set; }//
        public double Longitude { get; set; } //
        public required int Distance{get;set;} //
        public ActionTypes? Type {get;set;}//
        public DateTime? OdKada{get;set;}//
        public DateTime? DoKada{get;set;}//
        public ActionStatus? Status{get;set;}//za sad cemo ovde uvek da saljemo null jer mislim da nema potrebe
        public bool? CheapestFirst {get;set;} //
         public int Skip {get;set;}=0; // koliko ce akcija da preskoci - ovo se koristi kad hocu da ucitam nove akcije - prvi put je 0 pa ce bude 9, 18...
        public int Take{get;set;}=9;//koliko akcija da uzima - ako odlucim da uzimam veci/manji sample smo cu ga promenim ovde 
    }
}