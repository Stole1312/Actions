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

    [Authorize]
    [HttpPost("SendFriendRequest/{receiverId}")]
    public async Task<ActionResult> SendFriendRequest(int receiverId)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            //Ne moze se poslati zahtev samom sebi
            if(currentUserId == receiverId)
                return BadRequest("You can not send friend request to yourself!");

            var receiver = await Context.Users.FindAsync(receiverId);
            if(receiver == null)
                return BadRequest("User does not exist!");

            //Provera da li su dva usera vec prijatelji
            bool alreadyFriends = await Context.Friends.AnyAsync(f =>
                (f.InitiatorID == currentUserId && f.ReceiverID == receiverId) ||
                (f.InitiatorID == receiverId && f.ReceiverID == currentUserId)
            );
            if(alreadyFriends)
                return BadRequest("You are already friends");

            //Provera da li vec postoji zahtev za prijateljstvo
            bool requestAlreadyExists = await Context.FriendRequests.AnyAsync(fr =>
                fr.Status == UserRequestStatus.Pending &&
                (
                    (fr.InitiatorID == currentUserId && fr.ReciverID == receiverId) ||
                    (fr.InitiatorID == receiverId && fr.ReciverID == currentUserId)
                )
            );
            if (requestAlreadyExists)
                return BadRequest("Friend request already exists!");

            var friendRequest = new FriendRequest
            {
                InitiatorID = currentUserId,
                ReciverID = receiverId,
                Status = UserRequestStatus.Pending,
                Created = DateTime.UtcNow
            };

            await Context.FriendRequests.AddAsync(friendRequest);
            await Context.SaveChangesAsync();

            return Ok("Friend request sent successfully!");

        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpGet("GetPendingFriendRequests")]
    public async Task<ActionResult> GetPendingFriendRequests()
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var requests = await Context.FriendRequests
                .Where(fr => fr.ReciverID == currentUserId && fr.Status == UserRequestStatus.Pending)
                .Include(fr => fr.Initiator)
                .Select(fr => new
                {
                    fr.ID,
                    fr.InitiatorID,
                    InitiatorUsername = fr.Initiator.Username,
                    InitiatorProfilePicture = fr.Initiator.ProfilePicture,
                    fr.Created,
                    fr.Status
                })
                .ToListAsync();

                return Ok(requests);
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpPut("RespondFriendRequest/{requestId}")]
    public async Task<ActionResult> RespondFriendRequest(int requestId, [FromBody] RespondFriendRequestDTO rfrDTO)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var request = await Context.FriendRequests.FindAsync(requestId);
            if(request == null)
                return BadRequest("Friend request does not exist!");

            //Ne moze se odgovoriti na request ako nije upucen trenutnom useruj
            if(request.ReciverID != currentUserId)
                return Unauthorized("You can not respond to this request!");

            //Ako status nije pending to znaci da je na request vec odgovoreno
            if (request.Status != UserRequestStatus.Pending)
                return BadRequest("This request is already resolved!");

            //Status moze biti samo Approved ili Rejected
            if (rfrDTO.Status != UserRequestStatus.Approved && rfrDTO.Status != UserRequestStatus.Rejected)
                return BadRequest("Invalid status!");

            request.Status = rfrDTO.Status;
            //Ako je approved request useri postaju prijatelji
            if(rfrDTO.Status == UserRequestStatus.Approved)
            {
                var friend = new Friends
                {
                    InitiatorID = request.InitiatorID,
                    ReceiverID = request.ReciverID,
                    FriendsSince = DateTime.UtcNow
                };

                await Context.Friends.AddAsync(friend);
            }
            await Context.SaveChangesAsync();

            return Ok("Friend request resolved successfully!");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}