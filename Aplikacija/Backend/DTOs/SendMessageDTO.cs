namespace Backend.DTOs;

public class SendMessageDTO
{
    public int ChatID { get; set; }
    public string Content { get; set; } = string.Empty;
}