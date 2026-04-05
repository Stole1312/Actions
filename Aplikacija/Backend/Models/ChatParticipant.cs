using System;
public class ChatParticipant
{
    [Key]
    public int ID { get; set; }
    public int UserID { get; set; }
    public int ChatID { get; set; }
    public bool IsAdmin { get; set; }

    //Navigation property
    public User User { get; set; }
    public Chat Chat { get; set; }
}