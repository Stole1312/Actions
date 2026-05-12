using System.Diagnostics.CodeAnalysis;
using System.Reflection.Metadata;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("[controller]")]
public class CommunicationController : ControllerBase
{
    public Backend.Models.AppDBContext Context { get; set; }
    private readonly IHubContext<ChatHub> _hubContext;
    public CommunicationController(Backend.Models.AppDBContext context, IHubContext<ChatHub> hubContext)
    {
        Context = context;
        _hubContext = hubContext;
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
    [HttpPost("OpenPrivateChat")]
    public async Task<ActionResult> OpenPrivateChat([FromBody] OpenPrivateChatDTO opcDTO)
    {
        try
        {
            //Izvlaci iz tokena ID trenutno ulogovanog korisnika
            int currentUserId = GetCurrentUserId();

            //Proverava da li je i drugi korisnik validan
            if(opcDTO.otherUserId <= 0)
                return BadRequest("Other user ID not valid!");

            //Zabrana da neko pravi chat sam sa sobom
            if(currentUserId == opcDTO.otherUserId)
                return BadRequest("You can not open private chat with yourself!");

            //Provera da li trenutni korisnik postoji - Koristim ga samo za ime chata NIJE IDEALNO TREBA SE UNAPREDI!
            var currentUser = await Context.Users.FindAsync(currentUserId);
            if (currentUser == null)
                return BadRequest("Current user not found!");

            //Provera da li drugi korisnik postoji
            var otherUser = await Context.Users.FindAsync(opcDTO.otherUserId);
            if(otherUser == null)
                return BadRequest("User does not exist!");

            //Trazi postojeci chat
            var existingChat = await Context.Chats
                .Include(c => c.Participants)
                .FirstOrDefaultAsync( c =>
                    c.AkcijaID == null &&
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
                Name = $"{currentUser.Username}-{otherUser.Username}",
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
            //TEST ZA POOLER (VISAK ZA NORMALNE USLOVE)
            await Context.SaveChangesAsync();
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

    [Authorize]
    [HttpPost("OpenActionChat/{akcijaId}")]
    public async Task<ActionResult> OpenPrivateChat(int akcijaId)
    {
        try
        {
            //Izvlaci iz tokena ID trenutno ulogovanog korisnika
            int currentUserId = GetCurrentUserId();

            //Proverava validnost akcije
            if(akcijaId <= 0)
                return BadRequest("Action ID not valid!");

            //Pronalazi datu akciju, u slucaju da ne postoji greska
            var akcija = await Context.Akcije.FindAsync(akcijaId);
            if(akcija == null)
                return BadRequest("Action does not exist!");

            //Pronalazenje producera
            int producerId = akcija.ProducerID;

            //Zabrana da se napravi chat sam sa sobom
            if(currentUserId == producerId)
                return BadRequest("You can not open action chat with yourself!");

            //Provera da li producer postoji
            var producer = await Context.Users.FindAsync(producerId);
            if(producer == null)
                return BadRequest("User does not exist!");

            //Trazi postojeci chat
            var existingChat = await Context.Chats
                .Include(c => c.Participants)
                .FirstOrDefaultAsync( c =>
                    c.AkcijaID == akcijaId &&
                    c.Type == ChatType.Action &&
                    c.Participants.Count == 2 &&
                    c.Participants.Any(p => p.UserID == currentUserId) &&
                    c.Participants.Any(p => p.UserID == producerId)
                );
            //Ako postoji vrati na front ID chat-a
            if(existingChat != null)
            {
                return Ok(new
                {
                    Message = "Action chat alredy exist.",
                    ChatId = existingChat.ID
                });
            }

            //Pravljenje novog chata
            var newChat = new Chat
            {
                Name = $"{akcija.Title}",
                Type = ChatType.Action,
                AkcijaID = akcijaId
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
                UserID = producerId
            };

            await Context.ChatParticipants.AddAsync(participant1);
            //TEST ZA POOLER (VISAK ZA NORMALNE USLOVE)
            await Context.SaveChangesAsync();
            await Context.ChatParticipants.AddAsync(participant2);
            await Context.SaveChangesAsync();

            return Ok(new
            {
               Message = "Action chat created successfully!",
               ChatId = newChat.ID 
            });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpGet("GetChatById/{chatId}")]
    public async Task<ActionResult> GetChatById(int chatId)
    {
        try
        {
            //Izvlaci iz tokena ID trenutno ulogovanog korisnika
            int currentUserId = GetCurrentUserId();

            //Provera validnosti chat-a
            if(chatId <= 0 )
                return BadRequest("Chat ID is not valid");

            //Pronadji chat sa ucesnicima i porukama
            var chat = await Context.Chats
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.ID == chatId);

            if(chat == null)
                return BadRequest("Chat does not exist!");

            //Provera da li je korisnik ucesnik tog chata
            bool isParticipant = chat.Participants.Any(p => p.UserID == currentUserId);
            if (!isParticipant)
                return StatusCode(403, "You are not participant of this chat!");

            return Ok(new
            {
                chat.ID,
                chat.Name,
                chat.Type,
                chat.AkcijaID,
                Participants = chat.Participants.Select(p => new
                {
                    p.ID,
                    p.UserID,
                    p.IsAdmin
                }),
                Messages = chat.Messages
                .OrderBy(m => m.Sent)
                .Select(m => new
                {
                    m.ID,
                    m.Content,
                    m.SenderID,
                    m.ChatID,
                    m.Sent
                })
            });
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpGet("GetMyChats")]
    public async Task<ActionResult> GetMyChats()
    {
        try
        {
            //Izvlaci iz tokena ID trenutno ulogovanog korisnika
            int currentUserId = GetCurrentUserId();

            //Pronalazi sve chatove
            var chats = await Context.ChatParticipants
                .Where(cp => cp.UserID == currentUserId)
                .Select(cp => cp.Chat)
                .ToListAsync();

            return Ok(chats);
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpPost("SendMessage")]
    public async Task<ActionResult> SendMessage([FromBody] SendMessageDTO smDTO)
    {
        try
        {
            //Izvlaci iz tokena ID trenutno ulogovanog korisnika
            int currentUserId = GetCurrentUserId();

            //Provera validnosti chata
            if(smDTO.ChatID <= 0)
                return BadRequest("Chat ID is not valid!");

            //Provera postojanja sadrzaja poruke
            if(string.IsNullOrWhiteSpace(smDTO.Content))
                return BadRequest("Message can not be empty!");

            var chat = await Context.Chats.FindAsync(smDTO.ChatID);
            if(chat == null)
                return BadRequest("Chat does not exist");

            //Provera da li se korisnik nalazi u chatu
            bool isParticipant = await Context.ChatParticipants
                .AnyAsync(cp => cp.ChatID == smDTO.ChatID && cp.UserID == currentUserId);

            if (!isParticipant)
                return StatusCode(403, "You are not participant of this chat!");

            var newMessage = new Message
            {
                ChatID = smDTO.ChatID,
                SenderID = currentUserId,
                Content = smDTO.Content,
                Sent = DateTime.UtcNow 
            };

            await Context.Messages.AddAsync(newMessage);
            await Context.SaveChangesAsync();

            //Salje poruku u realtime-u svim korisnicima koj su u tom chat-u
            await _hubContext.Clients
                .Group($"chat-{smDTO.ChatID}")
                .SendAsync("ReceiveMessage", new //Event koji se salje frontendu
                {
                    newMessage.ID,
                    newMessage.ChatID,
                    newMessage.SenderID,
                    newMessage.Content,
                    newMessage.Sent
                });

            return Ok(new
            {
               Message = "Message sent successfully!",
               MessageId = newMessage.ID
            });
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpDelete("DeleteChat/{chatId}")]
    public async Task<ActionResult> DeleteChat(int chatId)
    {
        try
        {
            //Izvlaci iz tokena ID trenutno ulogovanog korisnika
            int currentUserId = GetCurrentUserId();

            //Proverava validnost chata
            if (chatId <= 0)
                return BadRequest("Chat ID not valid!");

            //Pronalazi zadati chat, ucesnike i poruke u tom chatu
            var chat = await Context.Chats
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.ID == chatId);

            if (chat == null)
                return NotFound("Chat does not exist!");

            var currentParticipant = chat.Participants
                .FirstOrDefault(p => p.UserID == currentUserId);

            if (currentParticipant == null)
                return StatusCode(403, "You are not a participant of this chat!");

            if (!currentParticipant.IsAdmin)
                return StatusCode(403, "Only admin can delete this chat!");

            Context.ChatParticipants.RemoveRange(chat.Participants);
            Context.Messages.RemoveRange(chat.Messages);
            Context.Chats.Remove(chat);
            await Context.SaveChangesAsync();

            return Ok("Chat deleted successfully!");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpDelete("DeleteMessage/{messageId}")]
    public async Task<ActionResult> DeleteMessage(int messageId)
    {
        try
        {
            //Izvlaci iz tokena ID trenutno ulogovanog korisnika
            int currentUserId = GetCurrentUserId();

            //Proverava validnost poruke
            if (messageId <= 0)
                return BadRequest("Message ID not valid!");

            var message = await Context.Messages.FindAsync(messageId);
            if(message == null)
                return BadRequest("Message does not exist!");

            //Dozvola za brisanje samo sopstvene poruke
            if (message.SenderID != currentUserId)
                return BadRequest("You can delete only your own message!");

            Context.Messages.Remove(message);
            await Context.SaveChangesAsync();

            return Ok("Message deleted successfully!");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
}