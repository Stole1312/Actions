using System;

namespace Backend.Models
{
    public class DeoAkcije
    {
        [Key]
        public int ID{get;set;}
        public int UserID { get; set; }
        public int AkcijaID { get; set; }
        public bool isOrganizator{get;set;}=false;
        public bool deniedByOrganizator { get; set; }=false;
        // Navigation properties
        public User User { get; set; } = null!;
        public Akcija Akcija { get; set; } = null!;
    }
}