using System.Net.Sockets;
using System.Reflection.Metadata;
using System.Reflection.Metadata.Ecma335;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        public Backend.Models.AppDBContext Context { get; set; }

        private readonly IConfiguration _configuration;
        public UserController(Backend.Models.AppDBContext context, IConfiguration configuration)
        {
            Context = context;
            _configuration = configuration;
        }

        //ce da se koristi i za regiset
        [HttpPost("AddUser")]
        public async Task<ActionResult> AddUser([FromForm] UserRegisterVM usr)
        {
            try
            {
                //Korisnik na stranici moze da bira da li ce da bude korisnik ili producer
                //Takodje prilikom editovanja profila moze da promeni u producer
                if (string.IsNullOrWhiteSpace(usr.Username)) return BadRequest("User must have a username");
                if (string.IsNullOrWhiteSpace(usr.Email)) return BadRequest("User must have an email adresse");
                if (string.IsNullOrWhiteSpace(usr.Password)) return BadRequest("User must have a password");

                var checkUser = await Context.Users.FirstOrDefaultAsync(u => u.Username == usr.Username);

                if (checkUser != null)
                    return BadRequest("Username is already taken");

                string imageUrl = "https://zedivwyrdzaglvdyahoj.supabase.co/storage/v1/object/public/ProfilePictures/defaultAvatar.jpg";
                string supabaseUrl = _configuration["Supabase:Url"] ?? throw new Exception("Supabase URL is missing in appsettings.");
                string supabaseKey = _configuration["Supabase:AnonKey"] ?? throw new Exception("Supabase AnonKey is missing in appsettings.");
                string bucketName = _configuration["Supabase:BucketName"] ?? "avatars";
                
                if(usr.ProfilePictureFile !=null && usr.ProfilePictureFile.Length > 0)
                {
                    var storageClient = new Supabase.Storage.Client(supabaseUrl + "/storage/v1", new Dictionary<string, string>
                    {
                        { "Authorization", $"Bearer {supabaseKey}" },
                        { "apikey", supabaseKey }
                    });

                    var extension = Path.GetExtension(usr.ProfilePictureFile.FileName);

                    var fileName = $"{usr.Username}_{DateTime.UtcNow.Ticks}{extension}";

                    using var ms = new MemoryStream();
                    await usr.ProfilePictureFile.CopyToAsync(ms); // Kopiramo sliku u memorijski strim
                    var fileBytes = ms.ToArray();

                    await storageClient.From(bucketName).Upload(fileBytes, fileName);
                    imageUrl = $"{supabaseUrl}/storage/v1/object/public/{bucketName}/{fileName}";
                }

                var user = new User
                {
                    Username = usr.Username,
                    Email = usr.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(usr.Password),
                    Bio = usr.Bio ?? "I <3 Actions",
                    isBanned = false,
                    VerificationStatus = VerifiedStatus.None,
                    ProfilePicture = imageUrl
                };

                await Context.Users.AddAsync(user);
                await Context.SaveChangesAsync();

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, usr.ID.ToString()),
                    new Claim(ClaimTypes.Name, usr.Username),
                    new Claim(ClaimTypes.Role, usr.Role.ToString())
                };

                var token = GenerateJwtToken(claims);

                //Na fontu cemo da ga cuvamo u local storage pomocu LocalStorage.setItem
                return Ok(new
                {
                    message = $"User {user.Username} with ID: {user.ID} has been added.",
                    userViewModel = MapUserToViewModel(user),
                    Token = token
                });
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        [HttpDelete("DeleteUser")]
        public async Task<ActionResult> DeleteUser([FromBody] int id)
        {
            try
            {
                var usr = await Context.Users.FindAsync(id);

                if (usr == null)
                    return BadRequest($"There is no user with ID: {id}");

                Context.Users.Remove(usr);
                await Context.SaveChangesAsync();

                return Ok($"User with ID: {id} has been deleted");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("EditUser")]
        public async Task<ActionResult> EditUser([FromForm] UserRegisterVM editedUser)
        {
            try
            {
                var userInDB = await Context.Users.FindAsync(editedUser.ID);

                if (userInDB == null)
                    return NotFound($"usr with ID {editedUser.ID} was not found.");

                userInDB.Username = editedUser.Username;
                userInDB.Email = editedUser.Email;
                userInDB.Role = editedUser.Role;
                userInDB.VerificationStatus = editedUser.VerificationStatus;
                userInDB.Bio=editedUser.Bio ?? userInDB.Bio;

                if (editedUser.ProfilePictureFile != null && editedUser.ProfilePictureFile.Length > 0)
                {
                    string supabaseUrl = _configuration["Supabase:Url"] ?? throw new Exception("Supabase URL missing.");
                    string supabaseKey = _configuration["Supabase:AnonKey"] ?? throw new Exception("Supabase AnonKey missing.");
                    string bucketName = _configuration["Supabase:BucketName"] ?? "avatars";

                    // Inicijalizacija Supabase Storage klijenta
                    var storageClient = new Supabase.Storage.Client(supabaseUrl + "/storage/v1", new Dictionary<string, string>
                    {
                        { "Authorization", $"Bearer {supabaseKey}" },
                        { "apikey", supabaseKey }
                    });

                    // Generisanje jedinstvenog imena fajla
                    var extension = Path.GetExtension(editedUser.ProfilePictureFile.FileName);
                    var fileName = $"{editedUser.Username}_edit_{DateTime.UtcNow.Ticks}{extension}";

                    // Pretvaranje IFormFile u niz bajtova
                    using var ms = new MemoryStream();
                    await editedUser.ProfilePictureFile.CopyToAsync(ms);
                    var fileBytes = ms.ToArray();

                    // Upload na Supabase Storage
                    await storageClient.From(bucketName).Upload(fileBytes, fileName);

                    // Postavljanje NOVOG URL-a u objekat baze
                    userInDB.ProfilePicture = $"{supabaseUrl}/storage/v1/object/public/{bucketName}/{fileName}";
                }

                await Context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"User with ID: {userInDB.ID} have been edited",
                    userViewModel = MapUserToViewModel(userInDB)
                });
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        /*
            Ideja za proces verifikacije:
                Korisnik klikne dugme da se verifikuje i posalje dokument da potvrdi verifikaciju
                Moderatori i Admini imaju sekciju na sajtu Requests u kojoj mogu da vide sve trenutno
                otvorene Requestove. Na klik im se otvara request i renderuju dva dugmeta (Accept/Decile) i Dokumnet
        */

        //Omogucava korisniku User i Producer da postave request
        [Authorize(Roles = "User, Producer")]
        [HttpPost("SubmitvVerificationRequest/{id}")]
        public async Task<ActionResult> SubmitVerificationRequest(int id, [FromBody] string document)
        {
            try
            {
                var request = new VerificationRequest
                {
                    Created = DateTime.UtcNow,
                    Status = UserRequestStatus.Pending,
                    InitiatorID = id,
                    Document=document,
                    Sender = await Context.Users.FindAsync(id)
                };

                Context.VerificationRequests.Add(request);
                await Context.SaveChangesAsync();

                return Ok("Request has been forwarded to administration");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        //Omogucava da se frontu posalje lista pendign verification requestova
        [Authorize(Roles = "Moderator, Admin")]
        [HttpGet("PendingVerifications")]
        public async Task<ActionResult> GetPendingVerifications()
        {
            var pending = await Context.VerificationRequests
                .Include(v => v.Sender)
                .Where(v => v.Status == UserRequestStatus.Pending)
                .ToListAsync();

            return Ok(pending);
        }

        //Omogucava da moderator/admin pogleda
        [Authorize(Roles = "Moderator, Admin")]
        [HttpPut("ReviewVerification/{id}")]
        public async Task<ActionResult> ReviewVerification(int id, [FromQuery] UserRequestStatus newStatus, [FromQuery] int moderatorId)
        {
            var request = await Context.VerificationRequests.FindAsync(id);
            if (request == null)
                return NotFound();

            request.Status = newStatus;
            request.ReviewerID = moderatorId;
            request.Reviewer = await Context.Users.FindAsync(moderatorId);

            if (newStatus == UserRequestStatus.Approved)
            {
                var user = await Context.Users.FindAsync(request.InitiatorID);
                if (user != null)
                    user.VerificationStatus = VerifiedStatus.Verified;
            }

            await Context.SaveChangesAsync();
            return Ok($"Verification requst status has been change to: {newStatus}");
        }

        [HttpPost("Login")]
        public async Task<ActionResult> Login([FromBody] LoginViewModel userData)
        {
            if (userData == null || string.IsNullOrEmpty(userData.Username))
            {
                return BadRequest("Nisu prosleđeni podaci za login.");
            }
                var user = await Context.Users.FirstOrDefaultAsync(u => u.Username == userData.Username);

                if (user == null)
                    return Unauthorized("Wrong username");

                bool correctPassword = BCrypt.Net.BCrypt.Verify(userData.Password, user.Password);

                if (!correctPassword)
                    return Unauthorized("Wrong password");

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.ID.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                };

                var token = GenerateJwtToken(claims);

                //Na fontu cemo da ga cuvamo u local storage pomocu LocalStorage.setItem
                return Ok(new { Token = token, userViewModel = MapUserToViewModel(user) });
        }

        //Moderatori ce da imaju negde input i dugme vezano za njega i tu ce moci
        //da unesu Username i da kliknu dugme i dobice alert You have added a moderator
        [Authorize(Roles = "Moderator,Admin")]
        [HttpPut("AddModerator")]
        public async Task<ActionResult> AddModerator([FromBody] string username)
        {
            var user = await Context.Users.FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
                return BadRequest($"There is no user with username: {username}");

            user.Role = UserRoles.Moderator;

            await Context.SaveChangesAsync();

            return Ok($"You have given {username} Moderator access");
        }

        [Authorize(Roles = "Moderator,Admin")]
        [HttpPut("BanUser")]
        public async Task<ActionResult> BanUser([FromBody] string username)
        {
            var user = await Context.Users.FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
                return BadRequest($"There is no user with username: {username}");

            user.isBanned = true;

            await Context.SaveChangesAsync();

            return Ok($"You banned {username}");
        }

        private UserViewModel MapUserToViewModel(User u)
        {
            return new UserViewModel
            {
                ID = u.ID,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,
                Bio = u.Bio,
                VerificationStatus = u.VerificationStatus,
                ProfilePicture = u.ProfilePicture
            };
        }

        private string GenerateJwtToken(List<Claim> claims)
        {
            // Citas kljuc izappsettings.json
            var keyString = _configuration.GetSection("AppSettings:Token").Value;
            // Pretvaramo taj string u niz bajtova
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString!));
            // HmacSha512 je standard za "potpis"
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );
            //pravi ga u string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}