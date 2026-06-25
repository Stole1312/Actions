using System.Net.Sockets;
using System.Reflection.Metadata;
using System.Reflection.Metadata.Ecma335;
using Castle.Core.Smtp;

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

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(string.IsNullOrEmpty(userIdClaim))
                throw new Exception("User ID not found in token!");
            
            return int.Parse(userIdClaim);
        }

        [HttpPost("StepOneCheck")]
        public async Task<ActionResult> StepOneCheck([FromForm] UserRegisterVM usr)
        {
            if (string.IsNullOrWhiteSpace(usr.Username)) return BadRequest("User must have a username");
            if (string.IsNullOrWhiteSpace(usr.Email)) return BadRequest("User must have an email adresse");
            if (string.IsNullOrWhiteSpace(usr.Password)) return BadRequest("User must have a password");

            var checkUserName = await Context.Users.FirstOrDefaultAsync(u => u.Username == usr.Username);
            if (checkUserName != null) return BadRequest("Username is already taken");
            var checkUserEmail = await Context.Users.FirstOrDefaultAsync(u => u.Email == usr.Email);
            if(checkUserEmail !=null) return BadRequest("This email is already registered");

            var random = new Random();
            int broj = random.Next(0, 1000000);
            
            // D6 - da bi vratio 000123 umesto 123
            string kod = broj.ToString("D6");

            //BRISEMO STARE
            var stariKodovi = Context.VerificationCodes.Where(c => c.Email == usr.Email);
            Context.VerificationCodes.RemoveRange(stariKodovi);

            var noviKod = new VerificationCode
            {
                Email = usr.Email,
                Code = kod,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15) // Tajmer ne mora gleda vremenske zone
            };

            //STAVLJAM NOVI
            Context.VerificationCodes.Add(noviKod);
            await Context.SaveChangesAsync();

            string mojEmail = _configuration["MailSettings:Email"]?? throw new Exception("Mail is missing from appsettings.");
            string mojaSifra = _configuration["MailSettings:Password"]?? throw new Exception("Password is missing from appsettings.");

            try
                {
                    var emailPoruka = new MimeMessage();
                    emailPoruka.From.Add(new MailboxAddress("Akcije", mojEmail)); 
                    emailPoruka.To.Add(new MailboxAddress(usr.Username, usr.Email));                      
                    emailPoruka.Subject = "Verifikacioni kod za registraciju";

                    emailPoruka.Body = new TextPart("html")
                    {
                        Text = $@"
                            <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                                <h3 style='color: #1a1a1a;'>Dobrodošli na Akcije!</h3>
                                <p style='color: #444;'>Molimo vas da potvrdite svoj email unoseći sledeći kod u aplikaciju:</p>
                                <div style='background: #fff7ed; border: 2.5px dashed #f59e0b; display: inline-block; padding: 10px 30px; margin: 15px 0; border-radius: 8px;'>
                                    <h2 style='color: #f59e0b; font-size: 32px; letter-spacing: 4px; margin: 0;'>{kod}</h2>
                                </div>
                                <p style='font-size: 12px; color: #9ca3af;'>Kod je validan narednih 15 minuta.</p>
                            </div>"
                    };

                    // Konekcija na SMTP
                    using (var klijent = new SmtpClient())
                    {
                        await klijent.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
                        
                        await klijent.AuthenticateAsync(mojEmail, mojaSifra);
                        
                        await klijent.SendAsync(emailPoruka);
                        await klijent.DisconnectAsync(true);
                    }
                }
                catch (Exception ex)
                {
                    Context.VerificationCodes.Remove(noviKod);
                    await Context.SaveChangesAsync();
                    
                    return StatusCode(500, $"Greška pri slanju verifikacionog mejla: {ex.Message}");
                }
            return Ok();
        }

        [HttpPost("StepTwoCheck")]
        public async Task<ActionResult> StepTwoCheck([FromBody] string code)
        {
            if (string.IsNullOrWhiteSpace(code)) 
                    return BadRequest("Morate uneti verifikacioni kod.");

                var zapisIzBaze = await Context.VerificationCodes
                    .FirstOrDefaultAsync(c => c.Code == code.Trim());

                if (zapisIzBaze == null) 
                    return BadRequest("Uneti kod je netačan.");

                if (DateTime.UtcNow > zapisIzBaze.ExpiresAt)
                {
                    Context.VerificationCodes.Remove(zapisIzBaze);
                    await Context.SaveChangesAsync();
                    
                    return BadRequest("Verifikacioni kod je istekao. Molimo pokrenite registraciju ponovo.");
                }

                string potvrdjeniEmail = zapisIzBaze.Email;

                Context.VerificationCodes.Remove(zapisIzBaze);
                await Context.SaveChangesAsync();

                return Ok(new { 
                    message = "Email uspešno verifikovan!", 
                    email = potvrdjeniEmail 
                });
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
                string bucketName = _configuration["Supabase:BucketName"] ?? "ProfilePictures";
                
                if (usr.ProfilePictureFile != null && usr.ProfilePictureFile.Length > 0)
                {
                    try
                    {
                        // Inicijalizacija Storage klijenta
                        var storageClient = new Supabase.Storage.Client(supabaseUrl, new Dictionary<string, string>
                        {
                            { "Authorization", $"Bearer {supabaseKey}" },
                            { "apikey", supabaseKey }
                        });

                        // Generisanje jedinstvenog imena fajla
                        var extension = Path.GetExtension(usr.ProfilePictureFile.FileName);
                        if(string.IsNullOrEmpty(extension)) extension = ".jpg";
                        var fileName = $"{Guid.NewGuid()}{extension}";

                        // Pretvaranje u byte array - tako se mora salje
                        using var ms = new MemoryStream();
                        await usr.ProfilePictureFile.CopyToAsync(ms);
                        var fileBytes = ms.ToArray();

                        // Upload na Supabase pomocu httpa
                        using var httpClient = new HttpClient();
                        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {supabaseKey}");
                        httpClient.DefaultRequestHeaders.Add("apikey", supabaseKey);

                        var content = new ByteArrayContent(fileBytes);
                        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(
                            usr.ProfilePictureFile.ContentType
                        );

                        var uploadUrl = $"{supabaseUrl}/storage/v1/object/{bucketName}/{fileName}";

                        var uploadResponse = await httpClient.PostAsync(uploadUrl, content);
                        var responseBody = await uploadResponse.Content.ReadAsStringAsync();

                        if (!uploadResponse.IsSuccessStatusCode)
                            return BadRequest($"Upload failed: {responseBody}");

                        imageUrl = $"{supabaseUrl}/storage/v1/object/public/{bucketName}/{fileName}";
                    }
                    catch(Exception e)
                    {
                        return NotFound(e.Message);
                    }
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

        [Authorize]
        [HttpPut("EditUser")]
        public async Task<ActionResult> EditUser([FromForm] UserEditVM editedUser)
        {
            try
            {
                var id = GetCurrentUserId();
                var userInDB = await Context.Users.FindAsync(id);

                if (userInDB == null)
                    return NotFound($"usr with ID {id} was not found.");

                // 1. Provera za Username 
                if (!string.IsNullOrEmpty(editedUser.Username) && editedUser.Username != userInDB.Username)
                {
                    var usernameExists = await Context.Users.AnyAsync(u => u.Username == editedUser.Username && u.ID != id);
                    if (usernameExists)
                        return BadRequest("Korisničko ime je već zauzeto.");
                }

                // 2. Provera za Email 
                if (!string.IsNullOrEmpty(editedUser.Email) && editedUser.Email != userInDB.Email)
                {
                    var emailExists = await Context.Users.AnyAsync(u => u.Email == editedUser.Email && u.ID != id);
                    if (emailExists)
                        return BadRequest("Email adresa je već u upotrebi.");
                }    

                userInDB.Username = editedUser.Username ?? userInDB.Username;
                userInDB.Email = editedUser.Email ?? userInDB.Email;
                userInDB.Bio = editedUser.Bio ?? userInDB.Bio;

                if (editedUser.ProfilePictureFile != null && editedUser.ProfilePictureFile.Length > 0)
                {
                    string supabaseUrl = _configuration["Supabase:Url"] ?? throw new Exception("Supabase URL missing.");
                    string supabaseKey = _configuration["Supabase:AnonKey"] ?? throw new Exception("Supabase AnonKey missing.");
                    string bucketName = _configuration["Supabase:BucketName"] ?? "avatars";
                    string supabaseServiceKey = _configuration["Supabase:ServiceRoleKey"] ?? throw new Exception("Supabase ServiceRoleKey missing.");

                    // Inicijalizacija Supabase Storage klijenta
                    var storageClient = new Supabase.Storage.Client(supabaseUrl + "/storage/v1", new Dictionary<string, string>
                    {
                        { "Authorization", $"Bearer {supabaseServiceKey}" },
                        { "apikey", supabaseServiceKey }
                    });

                    if (!string.IsNullOrEmpty(userInDB.ProfilePicture))
                    {
                        string defaultAvatarUrl = "https://zedivwyrdzaglvdyahoj.supabase.co/storage/v1/object/public/ProfilePictures/defaultAvatar.jpg";

                            // Brisemo staru sliku samo ako nije u pitanju default avatar
                            if (userInDB.ProfilePicture != defaultAvatarUrl)
                            {
                                try
                                {
                                    // Izvlazimo samo ime fajla iz URL-a (sve nakon zadnjeg kosog kosa '/')
                                    var oldFileName = userInDB.ProfilePicture.Substring(userInDB.ProfilePicture.LastIndexOf('/') + 1);
                                    
                                    // Pozivamo brisanje iz bucketa
                                    await storageClient.From(bucketName).Remove(new List<string> { oldFileName });
                                }
                                catch (Exception storageEx)
                                {
                                    Console.WriteLine($"Neuspešno brisanje stare slike: {storageEx.Message}");
                                }
                            }
                            else
                            {
                                Console.WriteLine("Stara slika je podrazumevani avatar, preskače se brisanje sa Storage-a.");
                            }
                    }

                    // Generisanje jedinstvenog imena fajla za novu sliku
                    var extension = Path.GetExtension(editedUser.ProfilePictureFile.FileName);
                    if (string.IsNullOrEmpty(extension)) 
                        extension = ".jpg"; // fallback ako frontend zezne naziv
                    
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

        [Authorize]
        [HttpPost("SubmitVerificationRequest/{id}")]
        public async Task<ActionResult> SubmitVerificationRequest(int id, [FromForm] VerificationRequestDto dto)
        {
            try
            {
                var sender = await Context.Users.FindAsync(id);
                if(sender == null)
                    return BadRequest($"There is no user with ID: {id}");

                if (dto.Document == null || dto.Document.Length == 0)
                            return BadRequest("Document file is missing.");   

                string imageUrl;
                string supabaseUrl = _configuration["Supabase:Url"] ?? throw new Exception("Supabase URL is missing in appsettings.");
                string supabaseKey = _configuration["Supabase:AnonKey"] ?? throw new Exception("Supabase AnonKey is missing in appsettings.");
                string bucketName = _configuration["Supabase:DokumentacijaBucketName"] ?? "VerifikacijaDokumentacija";

                if (dto.Document != null && dto.Document.Length > 0)
                {
                    try
                    {
                        var storageClient = new Supabase.Storage.Client(supabaseUrl, new Dictionary<string, string>
                        {
                            { "Authorization", $"Bearer {supabaseKey}" },
                            { "apikey", supabaseKey }
                        });

                        var extension = Path.GetExtension(dto.Document.FileName);
                        if (string.IsNullOrEmpty(extension)) extension = ".jpg";
                        var fileName = $"{Guid.NewGuid()}{extension}";

                        using var ms = new MemoryStream();
                        await dto.Document.CopyToAsync(ms);
                        var fileBytes = ms.ToArray();

                        using var httpClient = new HttpClient();
                        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {supabaseKey}");
                        httpClient.DefaultRequestHeaders.Add("apikey", supabaseKey);

                        var content = new ByteArrayContent(fileBytes);
                        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(
                            dto.Document.ContentType
                        );

                        var uploadUrl = $"{supabaseUrl}/storage/v1/object/{bucketName}/{fileName}";

                        var uploadResponse = await httpClient.PostAsync(uploadUrl, content);
                        var responseBody = await uploadResponse.Content.ReadAsStringAsync();

                        if (!uploadResponse.IsSuccessStatusCode)
                            return BadRequest($"Upload failed: {responseBody}");

                        imageUrl = $"{supabaseUrl}/storage/v1/object/public/{bucketName}/{fileName}";
                    }
                    catch (Exception e)
                    {
                        return NotFound(e.Message);
                    }
                }
                else
                    return BadRequest("Document file is missing.");
        
                var request = new VerificationRequest
                {
                    Created = DateTime.UtcNow,
                    Status = UserRequestStatus.Pending,
                    InitiatorID = id,
                    Document=imageUrl,
                    Sender = sender
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

                if(user.isBanned)
                    return Unauthorized("You have been banned!");

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

            return 
            Ok($"You banned {username}");
        }

        [HttpGet("GetUserRoles")]
        public async Task<ActionResult> GetUserRoles()
        {
            var roles = Enum.GetValues(typeof(UserRoles))
                            .Cast<UserRoles>()
                            .Select(r => new 
                            { 
                                Id = (int)r, 
                                Name = r.ToString() 
                            })
                            .ToList();

            return Ok(roles);
        }

        [HttpPost("GetUserStats")]
        public async Task<ActionResult> GetUserStats([FromBody] int ID)
        {
            var prijateljiCout = await Context.Friends.CountAsync(f => f.InitiatorID == ID || f.ReceiverID == ID);
            var ratings = await Context.Akcije
                .Where(a => a.ProducerID == ID)
                .Select(a => (double)a.AverageRating)
                .ToListAsync();
            var akcijeCount = ratings.Count;
            double avrage = akcijeCount!=0 ? Math.Round(ratings.Average(),1) : 0.0;
            var followersCount = await Context.Follows.CountAsync(f => f.ProducerId == ID);

            return Ok(new
            {
                prijateljiCount = prijateljiCout,
                rating = avrage,
                akcijeCount = akcijeCount,
                followersCount = followersCount
            });
        }

        [HttpPost("GetUserByID")]
        public async Task<ActionResult> GetUserByID([FromBody] int ID)
        {
            try
            {
                var user = await Context.Users.FindAsync(ID);
                if(user!=null)
                    return Ok(MapUserToViewModel(user));
                else
                    return BadRequest("Nemamo ovakvog usera");
            }
            catch(Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("GetReportTypes")]
        public async Task<ActionResult> GetReportTypes()
        {
            var types = Enum.GetValues(typeof(ReportReason))
                    .Cast<ReportReason>()
                    .Select(e => new {
                        Id = (int)e,
                        Name = e.ToString()
                    });
            return Ok(types);
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
                ProfilePicture = u.ProfilePicture,
                Created = u.Created
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

        [Authorize(Roles = "Moderator,Admin")]
        [HttpGet("GetTotalUsers")]
        public async Task<ActionResult> GetTotalUsers()
        {
            var totalUsers = await Context.Users.CountAsync();

            return Ok(new
            {
                totalUsers = totalUsers
            });
        }

        private async Task PosaljiVerifikacioniKod(string primalacEmail, string kod, string naslov, TextPart  tekst)
        {
            string mail = Environment.GetEnvironmentVariable("MAIL") 
                ?? throw new Exception("MAIL ključ nedostaje u .env fajlu.");
                
            string sifra = Environment.GetEnvironmentVariable("SIFRA") 
                ?? throw new Exception("SIFRA ključ nedostaje u .env fajlu.");
            var message = new MimeMessage();
            // Ovde unosiš ime tvoje aplikacije i tvoj zvanični mail sa kog šalješ
            message.From.Add(new MailboxAddress("Akcije", mail));
            message.To.Add(new MailboxAddress("", primalacEmail));
            message.Subject = naslov;

            // Izgled mejla koji stiže korisniku
            message.Body = tekst;

            using (var client = new SmtpClient())
            {                
                // Povezivanje na Gmail SMTP server (host, port, SSL)
                await client.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
                
                // Ovde unosiš tvoj mail i lozinku (Google App Password, ne tvoju glavnu šifru!)
                await client.AuthenticateAsync(mail, sifra);
                
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
        }
    }
}