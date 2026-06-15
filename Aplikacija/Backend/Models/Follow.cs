namespace Backend.Models
{
    public class Follow
    {
        public int ID { get; set; }

        public int ConsumerId { get; set; }
        public User? Consumer { get; set; }

        public int ProducerId { get; set; }
        public User? Producer { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}