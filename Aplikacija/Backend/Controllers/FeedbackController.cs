namespace Backend.Controllers;

[ApiController]
[Route("[controller]")]
public class FeedbackController : ControllerBase
{
    public Backend.Models.AppDBContext Context { get; set; }
    public FeedbackController(Backend.Models.AppDBContext context)
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

    [Authorize]
    [HttpPost("AddComment/{akcijaId}")]
    public async Task<ActionResult> AddComment(int akcijaId, [FromBody] AddCommentDTO acDTO)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var akcija = await Context.Akcije.FindAsync(akcijaId);
            if(akcija == null)
                return BadRequest("Action does not exist!");

            //Akcija mora biti zavrsena
            if(akcija.Status != ActionStatus.Over)
                return BadRequest("You can comment only after action is over!");

            //Provera da li je trenutni korisnik deo akcije
            bool participated = await Context.DeoAkcije.AnyAsync(x =>
                x.AkcijaID == akcijaId &&
                x.UserID == currentUserId &&
                x.deniedByOrganizator == false
            );
            if(!participated)
                return BadRequest("Only participants can comment on this action!");

            //Komentar ne sme biti prazan
            if(string.IsNullOrWhiteSpace(acDTO.Content))
                return BadRequest("Comment can not be empty!");

            var comment = new Comment
            {
                UserID = currentUserId,
                AkcijaID = akcijaId,
                Content = acDTO.Content,
                TimePosted = DateTime.UtcNow
            };

            await Context.Comments.AddAsync(comment);
            await Context.SaveChangesAsync();

            return Ok("Comment added succesfully!");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpDelete("DeleteComment/{commentId}")]
    public async Task<ActionResult> DeleteComment(int commentId)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var comment = await Context.Comments.FindAsync(commentId);
            if (comment == null)
                return BadRequest("Comment does not exist!");

            var currentUser = await Context.Users.FindAsync(currentUserId);
            if (currentUser == null)
                return BadRequest("Current user does not exist!");

            //Ako korisnik nije admin i vlasnik komentara, odnosno korisnik je organizator akcije, ne moze da brise komentar
            bool isAdmin = currentUser.Role == UserRoles.Admin;
            bool isCommentOwner = comment.UserID == currentUserId;
            if (!isAdmin && !isCommentOwner)
                return BadRequest("You can delete only your own comment!");

            Context.Comments.Remove(comment);
            await Context.SaveChangesAsync();

            return Ok("Comment deleted successfully!");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("GetCommentsForAction/{akcijaId}")]
    public async Task<ActionResult> GetCommentsForAction(int akcijaId)
    {
        try
        {
            var action = await Context.Akcije.FindAsync(akcijaId);
            if (action == null)
                return BadRequest("Action does not exist!");

            //Akcija mora biti zavrsena
            if (action.Status != ActionStatus.Over)
                return BadRequest("Comments are available only after action is over!");

            var comments = await Context.Comments
                .Where(c => c.AkcijaID == akcijaId)
                .Include(c => c.User)
                .OrderByDescending(c => c.TimePosted)
                .Select(c => new
                {
                    c.ID,
                    c.Content,
                    c.TimePosted,
                    User = new
                    {
                        c.User.ID,
                        c.User.Username,
                        c.User.ProfilePicture
                    }
                })
                .ToListAsync();

            return Ok(comments);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}