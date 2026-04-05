using System;

namespace Backend.Models
{
    public class SlikaSaAkcije
    {
        [Key]
        public int ID{get;set;}
        public int UploaderID { get; set; }
        public int AkcijaID { get; set; }
        public string Picture{get;set;}
        public bool isApproved { get; set; }
        public DateTime TimeUploaded{get;set;}
        // Navigation properties
        public User User { get; set; }
        public Akcija Akcija { get; set; }
    }
}