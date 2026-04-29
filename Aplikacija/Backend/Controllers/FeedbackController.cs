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

    [Authorize]
    [HttpPost("RateAction/{akcijaId}")]
    public async Task<ActionResult> RateAction(int akcijaId, [FromBody] AddRatingDTO arDTO)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            //Ocena samo izmedju 1 i 5
            if(arDTO.Rate < 1 || arDTO.Rate > 5)
                return BadRequest("Rating must be between 1 and 5!");

            var akcija = await Context.Akcije.FindAsync(akcijaId);
            if(akcija == null)
                return BadRequest("Action does not exist!");

            //Akcija mora biti gotova
            if(akcija.Status != ActionStatus.Over)
                return BadRequest("You can rate only after action is over!");

            bool participated = await Context.DeoAkcije.AnyAsync(x => 
                x.AkcijaID == akcijaId &&
                x.UserID == currentUserId &&
                x.deniedByOrganizator == false
            );
            if(!participated)
                return BadRequest("Only participants can rate this action!");

            //Ako je korisnik vec ocenio akciju, moze samo da promeni postojecu
            var existingRating = await Context.Ratings
                .FirstOrDefaultAsync(r =>
                    r.ActionID == akcijaId &&
                    r.UserID == currentUserId
                );
            //Promena postojeceg rejtinga
            if(existingRating != null)
            {
                int oldRate = existingRating.Rate;
                existingRating.Rate = arDTO.Rate;

                akcija.AverageRating = ((akcija.AverageRating * akcija.RatingCount) - oldRate + arDTO.Rate) 
                    / akcija.RatingCount;
            }
            //Dodavanje novog rejtinga
            else
            {
                var rating = new Rating
                {
                    UserID = currentUserId,
                    ActionID = akcijaId,
                    Rate = arDTO.Rate
                };
                await Context.Ratings.AddAsync(rating);

                akcija.AverageRating = ((akcija.AverageRating * akcija.RatingCount) + arDTO.Rate) 
                    / (akcija.RatingCount + 1);

                akcija.RatingCount++;
            }
            await Context.SaveChangesAsync();

            return Ok("Rating saved successfully!");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("GetRatingForAction/{akcijaId}")]
    public async Task<ActionResult> GetRatingForAction(int akcijaId)
    {
        try
        {
            var akcija = await Context.Akcije.FindAsync(akcijaId);
            if(akcija == null)
                return BadRequest("Action does not exist!");

            return Ok(new
            {
                AverageRating = Math.Round(akcija.AverageRating, 1),
                RatingCount = akcija.RatingCount
            });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpDelete("DeleteRating/{ratingId}")]
    public async Task<ActionResult> DeleteRating(int ratingId)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var rating = await Context.Ratings.FindAsync(ratingId);
            if(rating == null)
                return BadRequest("Rating does not exist!");

            var currentUser = await Context.Users.FindAsync(currentUserId);
            if(currentUser == null)
                return BadRequest("Current user does not exist!");

            //Poruku moze izbrisati admin ili osoba koja je ostavila rejting
            bool isAdmin = currentUser.Role == UserRoles.Admin;
            bool isRatingOwner = rating.UserID == currentUserId;
            if (!isAdmin && !isRatingOwner)
                return BadRequest("You can delete only your own rating!");

            var akcija = await Context.Akcije.FindAsync(rating.ActionID);
            if (akcija == null)
                return BadRequest("Action does not exist!");
            
            //Ako je to jedini rejting postavi rejting na 0
            if (akcija.RatingCount <= 1)
            {
                akcija.AverageRating = 0;
                akcija.RatingCount = 0;
            }
            //Ako nije obrisi ga i izracunaj novi prosecni
            else
            {
                akcija.AverageRating = ((akcija.AverageRating * akcija.RatingCount) - rating.Rate)
                    / (akcija.RatingCount - 1);

                akcija.RatingCount--;
            }

            return Ok("Rating deleted successfully!");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpPost("ReportUser/{reportedUserId}")]
    public async Task<ActionResult> ReportUser(int reportedUserId, [FromBody] ReportUserDTO ruDTO)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            //Ogranicenje da korisnik ne moze da prijavi sam sebe
            if(currentUserId == reportedUserId)
                return BadRequest("You can not report yourself!");

            var reportedUser = Context.Users.FindAsync(reportedUserId);
            if(ReportUser == null)
                return BadRequest("User does not exist!");

            var report = new Report
            {
                InitiatorID = currentUserId,
                ReciverID = reportedUserId,
                Reason = ruDTO.Reason,
                Description = ruDTO.Description,
                Created = DateTime.UtcNow,
                Status = UserRequestStatus.Pending
            };

            await Context.Reports.AddAsync(report);
            await Context.SaveChangesAsync();

            return Ok("User reported successfully!");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("GetReports")]
    public async Task<ActionResult> GetReports()
    {
        try
        {
            var reports = await Context.Reports
                .Include(r => r.Sender)
                .Include(r => r.Reciver)
                .OrderByDescending(r => r.Created)
                .Select(r => new
                {
        
                    r.ID,
                    r.Reason,
                    r.Description,
                    r.Created,
                    r.Status,
                    Sender = new
                    {
                        r.Sender.ID,
                        r.Sender.Username,
                        r.Sender.ProfilePicture
                    },
                    ReportedUser = new
                    {
                        r.Reciver.ID,
                        r.Reciver.Username,
                        r.Reciver.ProfilePicture
                    }
                })
                .ToListAsync();

                return Ok(reports);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("ChangeReportStatus/{reportId}")]
    public async Task<ActionResult> ChangeReportStatus(int reportId, [FromBody] UserRequestStatus status)
    {
        try
        {
            var report = await Context.Reports.FindAsync(reportId);
            if(report == null)
                return BadRequest("Report does not exist!");

            report.Status = status;

            await Context.SaveChangesAsync();

            return Ok("Report status updated successfully!");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpDelete("DeleteReport/{reportId}")]
    public async Task<ActionResult> DeleteReport(int reportId)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var report = await Context.Reports.FindAsync(reportId);
            if(report == null)
                return BadRequest("Report does not exist!");

            var currentUser = await Context.Users.FindAsync(currentUserId);
            if(currentUser == null)
                return BadRequest("Current user does not exist!");

            //Samo admin i vlasnik svog reporta mogu obrisati report
            bool isAdmin = currentUser.Role == UserRoles.Admin;
            bool isReportOwner = report.InitiatorID == currentUserId;
            if(!isAdmin && !isReportOwner)
                return BadRequest("You can delete only your report!");

            Context.Reports.Remove(report);
            await Context.SaveChangesAsync();

            return Ok("Report deleted successfully!");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}