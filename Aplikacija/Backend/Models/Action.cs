using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Akcija
    {
        [Key]
        public int ID {get;set;}
        public required string Title {get;set;}
        public required string Description {get;set;}
        public required string Location{get;set;}
        public ActionTypes Type {get;set;}
        public DateTime DateAndTime{get;set;}
        public User ProducerID {get;set;}
        public int maxParticipants {get;set;}
        public decimal Price {get;set;}
        public ActionStatus Status{get;set;}
        public DateTime Created {get;set;}
    }
}

/*- ID: int
- Title: string
- Description: string
- Location: string
- Type: enum
- DateTime: datetime
- ProducerID: int
- maxParticipants: int
- Price: double
-Status: enum
- Created: dateTime*/