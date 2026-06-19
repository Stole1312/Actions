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
        public DateTime DTStart{get;set;}
        public DateTime DTEnd{get;set;}
        public int ProducerID{get;set;}
        //Navigation property
        public User Producer {get;set;} = null!;
        public int? maxParticipants {get;set;}
        public int? currentNumParticipants{get;set;}=1;
        public decimal? Price {get;set;}
        public ActionStatus Status{get;set;}
        public DateTime Created {get;set;}
        public double AverageRating { get; set; }
        public int RatingCount { get; set; }

        public string? ActionPicture {get;set;}
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