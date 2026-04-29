namespace Backend.Controllers;

public class SocialController : ControllerBase
{
    public Backend.Models.AppDBContext Context { get; set; }
    public SocialController(Backend.Models.AppDBContext context)
    {
        Context = context;
    }

    //Funkcija za proveravanje validnosti tokena - Izvlacenje ID trenutno ulogovanog korisnika
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(string.IsNullOrEmpty(userIdClaim))
            throw new Exception("User ID not found in token!");
        
        return int.Parse(userIdClaim);
    }
}