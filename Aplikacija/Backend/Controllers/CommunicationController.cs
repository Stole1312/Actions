using System.Diagnostics.CodeAnalysis;
using System.Reflection.Metadata;
using System.Runtime.Serialization;
using System.Security.Claims;

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

    [Authorize]
    [HttpPost("OpenPrivateChat")]
    public async Task<ActionResult> OpenPrivateChat([FromBody] OpenPrivateChatDTO opcDTO)
    {
        try
        {
            //Izvlaci iz tokena ID trenutno ulogovanog korisnika
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(string.IsNullOrEmpty(userIdClaim))
                return BadRequest("User ID not found in token!");
            int currentUserId = int.Parse(userIdClaim);

            //Proverava da li je i drugi korisnik validan
            if(opcDTO.otherUserId <= 0)
                return BadRequest("Other user ID not valid!");

            //Zabrana da neko pravi chat sam sa sobom
            if(currentUserId == opcDTO.otherUserId)
                return BadRequest("You can not open private chat with yourself!");

            //Provera da li drugi korisnik postoji
            var otherUserId = await Context.Users.FindAsync(opcDTO.otherUserId);
            if(otherUserId == null)
                return BadRequest("User does not exist!");

            //Trazi postojeci chat
            var existingChat = await Context.Chats
                .Include(c => c.Participants)
                .FirstOrDefaultAsync( c =>
                    c.Type == ChatType.Private &&
                    c.Participants.Count == 2 &&
                    c.Participants.Any(p => p.UserID == currentUserId) &&
                    c.Participants.Any(p => p.UserID == opcDTO.otherUserId)
                );
            //Ako postoji vrati na front ID chat-a
            if(existingChat != null)
            {
                return Ok(new
                {
                    Message = "Private chat alredy exist.",
                    ChatId = existingChat.ID
                });
            }


            //Pravljenje novog chata
            var newChat = new Chat
            {
                Name = $"{otherUserId.Username}",
                Type = ChatType.Private
            };

            await Context.Chats.AddAsync(newChat);
            await Context.SaveChangesAsync();

            //Dodaje ucesnike za ovaj chat
            var participant1 = new ChatParticipant
            {
                ChatID = newChat.ID,
                UserID = currentUserId
            };

            var participant2 = new ChatParticipant
            {
                ChatID = newChat.ID,
                UserID = opcDTO.otherUserId
            };

            await Context.ChatParticipants.AddAsync(participant1);
            await Context.ChatParticipants.AddAsync(participant2);
            await Context.SaveChangesAsync();

            return Ok(new
            {
               Message = "Private chat created successfully!",
               ChatId = newChat.ID 
            });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
}