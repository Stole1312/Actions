namespace Backend.Controllers;

[ApiController]
[Route("[controller]")]
public class CommunicationController : ControllerBase
{
    public Backend.Models.AppDBContext Context { get; set; }
    public CommunicationController(Backend.Models.AppDBContext context)
    {
        Context = context;
    }
}