namespace Backend.Controllers;

[ApiController]
[Route("[controller]")]
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
                .OrderByDescending(fr => fr.Created)
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

    [Authorize]
    [HttpGet("GetFriends")]
    public async Task<ActionResult> GetFriends()
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var friends = await Context.Friends
                .Where(f => f.InitiatorID == currentUserId || f.ReceiverID == currentUserId)
                .Include(f => f.Initiator)
                .Include(f => f.Receiver)
                .Select(f => new 
                {
                    //Ako sam ja initiator vratice mi recivera i obrnuto
                    FriendID = f.InitiatorID == currentUserId ? f.ReceiverID : f.InitiatorID,
                    Username = f.InitiatorID == currentUserId ? f.Receiver.Username : f.Initiator.Username,
                    ProfilePicture = f.InitiatorID == currentUserId ? f.Receiver.ProfilePicture : f.Initiator.ProfilePicture,
                    f.FriendsSince
                })
                .ToListAsync();

            return Ok(friends);
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    //Remove request
    [Authorize]
    [HttpDelete("RemoveFriend/{friendId}")]
    public async Task<ActionResult> RemoveFriend(int friendId)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var friendship = await Context.Friends.FirstOrDefaultAsync(f =>
                (f.InitiatorID == currentUserId && f.ReceiverID == friendId) ||
                (f.InitiatorID == friendId && f.ReceiverID == currentUserId)
            );
            if(friendship == null)
                return BadRequest("Friendship does not exist!");

            Context.Friends.Remove(friendship);
            await Context.SaveChangesAsync();

            return Ok("Friend removed successfully!");      
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpGet("GetSentFriendRequests")]
    public async Task<ActionResult> GetSentFriendRequests()
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var requests = await Context.FriendRequests
                .Where(fr => fr.InitiatorID == currentUserId && fr.Status == UserRequestStatus.Pending)
                .Include(fr => fr.Reciver)
                .Select(fr => new
                {
                    fr.ID,
                    fr.ReciverID,
                    ReceiverUsername = fr.Reciver.Username,
                    ReceiverProfilePicture = fr.Reciver.ProfilePicture,
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
    [HttpDelete("CancelFriendRequest/{requestId}")]
    public async Task<ActionResult> CancelFriendRequest(int requestId)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var request = await Context.FriendRequests.FindAsync(requestId);
            if (request == null)
                return BadRequest("Friend request does not exist!");

            //User mora biti inicijator requesta da bi ga mogao obrisati
            if (request.InitiatorID != currentUserId)
                return Unauthorized("You can not cancel this request!");

            //Samo requestovi koji su pending se mogu obrisati
            if (request.Status != UserRequestStatus.Pending)
                return BadRequest("Only pending requests can be cancelled!");

            Context.FriendRequests.Remove(request);
            await Context.SaveChangesAsync();

            return Ok("Friend request cancelled successfully!");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpGet("GetFriendshipStatus/{userId}")]
    public async Task<ActionResult> GetFriendshipStatus(int userId)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            if (currentUserId == userId)
                return Ok(new { Status = "Self" });

            //Provera da li su useri prijatelji
            bool areFriends = await Context.Friends.AnyAsync(f =>
                (f.InitiatorID == currentUserId && f.ReceiverID == userId) ||
                (f.InitiatorID == userId && f.ReceiverID == currentUserId)
            );
            if (areFriends)
                return Ok(new { Status = "Friends" });

            //U slucaju da postoji request za dva usera, vrati zahtev koji je pristizajuci ili poslat
            var request = await Context.FriendRequests.FirstOrDefaultAsync(fr =>
                fr.Status == UserRequestStatus.Pending &&
                (
                    (fr.InitiatorID == currentUserId && fr.ReciverID == userId) ||
                    (fr.InitiatorID == userId && fr.ReciverID == currentUserId)
                )
            );
            if (request == null)
                return Ok(new { Status = "None" });

            if (request.InitiatorID == currentUserId)
                return Ok(new
                {
                    Status = "Outgoing",
                    RequestID = request.ID
                });

            return Ok(new
            {
                Status = "Incoming",
                RequestID = request.ID
            });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpPost("FollowProducer/{producerId}")]
    public async Task<ActionResult> FollowProducer(int producerId)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            if (currentUserId == producerId)
                return BadRequest("You can not follow yourself!");

            var producer = await Context.Users.FindAsync(producerId);
            if (producer == null)
                return BadRequest("Producer does not exist!");

            if (producer.Role != UserRoles.Producer)
                return BadRequest("You can only follow producers!");

            var alreadyFollowing = await Context.Follows.AnyAsync(f =>
                f.ConsumerId == currentUserId && f.ProducerId == producerId
            );
            if (alreadyFollowing)
                return BadRequest("You are already following this producer!");

            var follow = new Follow
            {
                ConsumerId = currentUserId,
                ProducerId = producerId,
                CreatedAt = DateTime.UtcNow
            };

            await Context.Follows.AddAsync(follow);
            await Context.SaveChangesAsync();

            return Ok("Producer followed successfully!");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpDelete("UnfollowProducer/{producerId}")]
    public async Task<ActionResult> UnfollowProducer(int producerId)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var follow = await Context.Follows.FirstOrDefaultAsync(f =>
                f.ConsumerId == currentUserId &&
                f.ProducerId == producerId);
            if (follow == null)
                return BadRequest("You are not following this producer!");

            Context.Follows.Remove(follow);
            await Context.SaveChangesAsync();

            return Ok("Producer unfollowed successfully!");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpGet("IsFollowing/{producerId}")]
    public async Task<ActionResult<bool>> IsFollowing(int producerId)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            bool isFollowing = await Context.Follows.AnyAsync(f =>
                f.ConsumerId == currentUserId &&
                f.ProducerId == producerId);

            return Ok(isFollowing);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpGet("GetFollowing")]
    public async Task<ActionResult> GetFollowing()
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            var following = await Context.Follows
                .Where(f => f.ConsumerId == currentUserId)
                .Include(f => f.Producer)
                .Select(f => new
                {
                    ProducerID = f.ProducerId,
                    Username = f.Producer!.Username,
                    ProfilePicture = f.Producer.ProfilePicture,
                    FollowedSince = f.CreatedAt,

                    ActionsCount = Context.Akcije.Count(a =>
                        a.ProducerID == f.ProducerId
                    ),

                    FollowersCount = Context.Follows.Count(follower =>
                        follower.ProducerId == f.ProducerId
                    )
                })
                .OrderByDescending(user => user.FollowersCount)
                .ToListAsync();

            return Ok(following);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpGet("FollowersCount/{producerId}")]
    public async Task<ActionResult<int>> GetFollowersCount(int producerId)
    {
        var producerExists = await Context.Users
            .AnyAsync(u => u.ID == producerId && u.Role == UserRoles.Producer);
        if (!producerExists)
            return NotFound("Producer ne postoji.");

        var count = await Context.Follows
            .CountAsync(f => f.ProducerId == producerId);

        return Ok(count);
    }

    [Authorize]
    [HttpGet("SearchUsers")]
    public async Task<ActionResult> SearchUsers([FromQuery] string search)
    {
        try
        {
            int currentUserId = GetCurrentUserId();

            if (string.IsNullOrWhiteSpace(search))
                return Ok(Array.Empty<object>());

            search = search.Trim();

            var users = await Context.Users
                .Where(u =>
                    u.ID != currentUserId &&
                    !u.isBanned &&
                    EF.Functions.ILike(u.Username, $"%{search}%")
                )
                .Select(u => new
                {
                    u.ID,
                    u.Username,
                    u.ProfilePicture,

                    IsProducer = u.Role == UserRoles.Producer,

                    FollowersCount = Context.Follows.Count(f =>
                        f.ProducerId == u.ID
                    ),

                    IsFollowing = Context.Follows.Any(f =>
                        f.ConsumerId == currentUserId &&
                        f.ProducerId == u.ID
                    ),

                    FriendshipStatus =
                        Context.Friends.Any(f =>
                            (f.InitiatorID == currentUserId && f.ReceiverID == u.ID) ||
                            (f.InitiatorID == u.ID && f.ReceiverID == currentUserId)
                        )
                            ? "Friends"

                            : Context.FriendRequests.Any(fr =>
                                fr.Status == UserRequestStatus.Pending &&
                                (
                                    (fr.InitiatorID == currentUserId &&
                                    fr.ReciverID == u.ID) ||

                                    (fr.InitiatorID == u.ID &&
                                    fr.ReciverID == currentUserId)
                                )
                            )
                                ? "Pending"

                                : "None"
                })
                .OrderByDescending(u => u.FollowersCount)
                .ThenBy(u => u.Username)
                .Take(5)
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}