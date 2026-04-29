namespace Backend.DTOs;

public class ReportUserDTO
{
    public ReportReason Reason { get; set; }
    public string Description { get; set; } = string.Empty;
}