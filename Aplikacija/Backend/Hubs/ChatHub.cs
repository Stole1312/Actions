using System.Security.Claims;

namespace Backend.Hubs;


//Ovo je sve za SignalR za realtime komunikaciju
[Authorize]
public class ChatHub : Hub
{
    private readonly AppDBContext _context;

    public ChatHub(AppDBContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(string.IsNullOrEmpty(userIdClaim))
            throw new HubException("User ID not found in token.");

        return int.Parse(userIdClaim);
    }

    public async Task JoinChat(int chatId)
    {
        int currentUserId = GetCurrentUserId(); 

        if(chatId <= 0)
            throw new HubException("Chat ID is not valid!");

        bool isParticipant = await _context.ChatParticipants
            .AnyAsync(cp => cp.ChatID == chatId && cp.UserID == currentUserId);
        if(!isParticipant)
            throw new HubException("You are not participant of this chat!");

        //Dodavanje konekcije (otvorenog taba u browseru) u sobu chat-{chatID}
        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{chatId}");
    }

    public async Task LeaveChat(int chatId)
    {
        //Izbacivanje konekcije (otvorenog taba u browseru) iz sobe chat-{chatID}
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat-{chatId}");
    }
}