using System;
namespace Backend.Models
{
    public class Rating
    {
        public int ID { get; set; }
        public int UserID { get; set; }
        public int ActionID { get; set; }
        public double Rate { get; set; }
        public User User { get; set; } = null!;
        public Akcija Akcija { get; set; } = null!;
    }
}