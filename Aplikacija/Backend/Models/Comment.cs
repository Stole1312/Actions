namespace Backend.Models
{
    public class Comment
    {
        public int ID { get; set; }
        public int UserID { get; set; }
        public int AkcijaID { get; set; }
        public string Content { get; set; }
        public DateTime TimePosted{get;set;}
 
        // Navigation properties
        public User User { get; set; }
        public Akcija Akcija { get; set; }
    }
}
 