using System.ComponentModel;
using System.Net;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;
using Microsoft.VisualBasic;
using Backend.DTOs;
using System.Runtime.CompilerServices;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ActionController : ControllerBase
    {
        public Backend.Models.AppDBContext Context { get; set; }
        private readonly IConfiguration _configuration;
        public ActionController(Backend.Models.AppDBContext context, IConfiguration configuration)
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

        [HttpPost("AddAkcija")]
        public async Task<ActionResult> AddAkcija([FromForm] AddAkcijaDTO akcijaDTO)
        {
            try
            {
                var userID = GetCurrentUserId();
                if (string.IsNullOrWhiteSpace(akcijaDTO.Title))
                    return BadRequest("Your action must have a title");
                if (string.IsNullOrWhiteSpace(akcijaDTO.Description))
                    return BadRequest("Your action must have a description");
                if (string.IsNullOrWhiteSpace(akcijaDTO.Location))
                    return BadRequest("Your action must have a location");
                else if (akcijaDTO.DTStart.ToUniversalTime() < DateTime.UtcNow)
                    return BadRequest("You cant add an akcija that has already started");

                var producer = await Context.Users.FindAsync(userID);
                if (producer == null)
                    return BadRequest($"There is no user with ID: {userID}");

                // Default slika ako korisnik ne uploaduje svoju
                string imageUrl = "https://zedivwyrdzaglvdyahoj.supabase.co/storage/v1/object/public/AkcijaPictures/defaultAkcija.jpg";
                string supabaseUrl = _configuration["Supabase:Url"] ?? throw new Exception("Supabase URL is missing in appsettings.");
                string supabaseKey = _configuration["Supabase:AnonKey"] ?? throw new Exception("Supabase AnonKey is missing in appsettings.");
                string bucketName = _configuration["Supabase:AkcijaBucketName"] ?? "AkcijaPictures";

                if (akcijaDTO.ActionPicture != null && akcijaDTO.ActionPicture.Length > 0)
                {
                    try
                    {
                        var storageClient = new Supabase.Storage.Client(supabaseUrl, new Dictionary<string, string>
                        {
                            { "Authorization", $"Bearer {supabaseKey}" },
                            { "apikey", supabaseKey }
                        });

                        var extension = Path.GetExtension(akcijaDTO.ActionPicture.FileName);
                        if (string.IsNullOrEmpty(extension)) extension = ".jpg";
                        var fileName = $"{Guid.NewGuid()}{extension}";

                        using var ms = new MemoryStream();
                        await akcijaDTO.ActionPicture.CopyToAsync(ms);
                        var fileBytes = ms.ToArray();

                        using var httpClient = new HttpClient();
                        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {supabaseKey}");
                        httpClient.DefaultRequestHeaders.Add("apikey", supabaseKey);

                        var content = new ByteArrayContent(fileBytes);
                        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(
                            akcijaDTO.ActionPicture.ContentType
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

                var akcija = new Akcija
                {
                    Title = akcijaDTO.Title,
                    Description = akcijaDTO.Description,
                    Location = akcijaDTO.Location,
                    Latitude = akcijaDTO.Latitude,
                    Longitude = akcijaDTO.Longitude,
                    Type = akcijaDTO.Type,
                    DTStart = akcijaDTO.DTStart,
                    DTEnd = akcijaDTO.DTEnd,
                    ProducerID = userID,
                    Producer = producer,
                    maxParticipants = (akcijaDTO.maxParticipants == 0 || akcijaDTO.maxParticipants == null) ? 10 : akcijaDTO.maxParticipants,
                    currentNumParticipants = 1,
                    Price = akcijaDTO.Price == null ? 0 : akcijaDTO.Price,
                    Status = 0,
                    Created = akcijaDTO.Created,
                    AverageRating = 0,
                    RatingCount = 0,
                    ActionPicture = imageUrl 
                };

                await Context.Akcije.AddAsync(akcija);
                await Context.SaveChangesAsync();

                return Ok($"Akcija {akcija.Title} with ID: {akcija.ID} has been added.");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpDelete("DeleteAkcija")]
        public async Task<ActionResult> DeleteAction([FromBody] int id)
        {
            try
            {
                var akcija = await Context.Akcije.FindAsync(id);

                if (akcija == null)
                    return BadRequest($"There is no Akcija with ID: {id}");

                Context.Akcije.Remove(akcija);
                await Context.SaveChangesAsync();

                return Ok($"Akcija with ID: {id} has been deleted");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("EditAkcija/{id}")]
        public async Task<ActionResult> EditAction(int id, [FromBody] EditAkcijaDTO izmenjenaAkcija)
        {
            try
            {
                var akcijaUBazi = await Context.Akcije.FindAsync(id);

                if (akcijaUBazi == null)
                    return NotFound($"Akcija with ID {id} was not found.");

                akcijaUBazi.Title =  izmenjenaAkcija.Title ?? akcijaUBazi.Title;
                akcijaUBazi.Description = izmenjenaAkcija.Description ?? akcijaUBazi.Description;
                akcijaUBazi.Location = izmenjenaAkcija.Location ?? akcijaUBazi.Location;
                akcijaUBazi.Latitude = izmenjenaAkcija.Latitude ?? akcijaUBazi.Latitude;
                akcijaUBazi.Longitude = izmenjenaAkcija.Longitude ?? akcijaUBazi.Longitude;
                akcijaUBazi.Type = izmenjenaAkcija.Type ?? akcijaUBazi.Type;
                akcijaUBazi.DTStart = izmenjenaAkcija.DTStart ?? akcijaUBazi.DTStart;
                akcijaUBazi.DTEnd = izmenjenaAkcija.DTEnd ?? akcijaUBazi.DTEnd;
                akcijaUBazi.maxParticipants = izmenjenaAkcija.maxParticipants ?? akcijaUBazi.maxParticipants;
                akcijaUBazi.Price = izmenjenaAkcija.Price ?? akcijaUBazi.Price;

                await Context.SaveChangesAsync();

                return Ok($"Akcija with ID: {akcijaUBazi.ID} have been edited");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("GetClientLocation")]
        public async Task<ActionResult> GetClientLocation()
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

                // Ako radiš u lokalu (localhost), IP će biti "::1" ili "127.0.0.1"
                // Pošto eksterni API-jevi ne mogu da lociraju localhost, ovde stavljamo neku pravu IP adresu radi testiranja u lokalu
                if (ipAddress == "::1" || ipAddress == "127.0.0.1" || string.IsNullOrEmpty(ipAddress))
                {
                    ipAddress = "24.135.132.10"; // Primer prave IP adrese iz Srbije (Niš/Beograd)
                }

                using var httpClient = new HttpClient();

                var response = await httpClient.GetAsync($"https://freeipapi.com/api/json/{ipAddress}");
                
                if (!response.IsSuccessStatusCode)
                    return BadRequest("Nije moguće preuzeti lokaciju sa eksternog servisa.");

                var content = await response.Content.ReadAsStringAsync();
                
                return Content(content, "application/json");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("FilterAkcija")]
        public async Task<ActionResult> FilterAkcija([FromQuery] AkcijaFilterDTO filter)
        {
            try
            {
                var query = Context.Akcije.AsQueryable();

                // po naslovu caseinsensitive
                if (!string.IsNullOrWhiteSpace(filter.Title))
                    query = query.Where(a => a.Title.ToLower().Contains(filter.Title.ToLower()));

                // po tipu
                if (filter.Type.HasValue)
                    query = query.Where(a => a.Type == filter.Type.Value);

                // po statusu (upcoming ongoing)
                if (filter.Status.HasValue)
                    query = query.Where(a => a.Status == filter.Status.Value);
                
                // opseg datuma - od kog do kog datuma zelim da akcija POCINJE
                if (filter.OdKada.HasValue)
                    query = query.Where(a => a.DTStart >= filter.OdKada.Value);
                if (filter.DoKada.HasValue)
                    query = query.Where(a => a.DTStart <= filter.DoKada.Value);

                // ovo je obim zemlje u km i ovo ce valjda da ufuli da uzme akcije samo koje su unutar odredjene distance od setovane lokacije
                double r = 6371;

                query = query.Where(a => 
                    (r * Math.Acos(
                        Math.Sin(filter.Latitude * Math.PI / 180) * Math.Sin(a.Latitude * Math.PI / 180) +
                        Math.Cos(filter.Latitude * Math.PI / 180) * Math.Cos(a.Latitude * Math.PI / 180) *
                        Math.Cos((a.Longitude * Math.PI / 180) - (filter.Longitude * Math.PI / 180))
                    )) <= filter.Distance
                );

                // cheapest first
                if (filter.CheapestFirst.HasValue && filter.CheapestFirst.Value)
                    query = query.OrderBy(a => a.Price ?? 0)
                                 .ThenByDescending(a => a.currentNumParticipants ?? 0);
                else
                    query = query.OrderByDescending(a => a.currentNumParticipants ?? 0);

                // vracam 9 akcija
                var rezultati = await query.Take(9).ToListAsync();

                if (rezultati.Count == 0)
                    return Ok(new List<Akcija>()); // ako nista nema prazan niz

                return Ok(rezultati);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost("ApplyAkcija/{akcijaID}")]
        public async Task<ActionResult> ApplyAkcija(int akcijaID)
        {
            try
            {
                var userID = GetCurrentUserId();
                var akcija = await Context.Akcije.FindAsync(akcijaID);
                var user = await Context.Users.FindAsync(userID);
                if(akcija == null)
                    return BadRequest($"Akcija with ID: {akcijaID} doesnt exist");
                if(user == null)
                    return BadRequest($"User with ID: {userID} doesnt exist");

                if(akcija.maxParticipants <= akcija.currentNumParticipants)
                    return BadRequest("This akcija is full");

                var deoAkcijeCheck = await Context.DeoAkcije.FirstOrDefaultAsync(d => d.AkcijaID == akcijaID && d.UserID == userID);
                if(deoAkcijeCheck!=null && deoAkcijeCheck.deniedByOrganizator)
                    return BadRequest("This user is denied by organizer");

                var deoAkcije = new DeoAkcije
                {
                    UserID = userID,
                    AkcijaID = akcijaID,
                    isOrganizator = akcija.ProducerID == userID ? true : false,
                    deniedByOrganizator = false,
                    User = user,
                    Akcija = akcija
                };

                await Context.DeoAkcije.AddAsync(deoAkcije);
                await Context.SaveChangesAsync();

                akcija.currentNumParticipants++;
                await Context.SaveChangesAsync();

                return Ok($"User with ID: {userID} has applied to Akcija with ID: {akcijaID} succesfully.");
            }
            catch(Exception e)
            {
                return BadRequest(e);
            }
        }
        [HttpPost("AllApplicants/{akcijaID}")]
        public async Task<ActionResult> AllApplicants(int akcijaID, [FromBody] bool showDenied)
        {
            try
            {
                var query = Context.DeoAkcije.Where(d => d.AkcijaID == akcijaID);
                if (!showDenied)
                    query = query.Where(d => d.deniedByOrganizator == false); 

                var allApplicants = await query
                    .Select(d => new SimpleUserViewModel
                    {
                        Username = d.User.Username,
                        Email = d.User.Email,
                        VerificationStatus = d.User.VerificationStatus,
                        ProfilePicture = d.User.ProfilePicture,
                        isBanned = d.User.isBanned
                    })
                    .ToListAsync();

                if(allApplicants.Count == 0)
                    return Ok("Noone has applied yet ;( ");
                
                return Ok(allApplicants);
            }
            catch(Exception e)
            {
                return BadRequest(e);
            }
        }
        [HttpPost("DenyApplicant/{akcijaID}/deny/{deniedUserID}/by/{producerUserID}")]
        public async Task<ActionResult> DenyApplicant(int akcijaID, int deniedUserID, int producerUserID)
        {
            try
            {
                var isOrganizer = await Context.DeoAkcije
                    .AnyAsync(d => d.AkcijaID == akcijaID && d.UserID == producerUserID && d.isOrganizator == true);
                if (!isOrganizer)
                    return Unauthorized("Only organizer can deny application");

                var deoAkcije = await Context.DeoAkcije.FirstOrDefaultAsync(d => d.AkcijaID == akcijaID && d.UserID == deniedUserID);
                if (deoAkcije == null)
                    return NotFound("There is no such user - akcija combination");

                deoAkcije.deniedByOrganizator = true;

                var akcija = await Context.Akcije.FindAsync(akcijaID);
                if(akcija ==null)
                    return BadRequest("Akcija is null");
                    
                akcija.currentNumParticipants--;

                await Context.SaveChangesAsync();

                return Ok($"User with ID: {deniedUserID} has been denied to attend Akcija with ID: {akcijaID} succesfully.");
            }
            catch(Exception e)
            {
                return BadRequest(e);
            }
        }
        [HttpGet("GetActionTypes")]
        public async Task<ActionResult> GetActionTypes()
        {
            var types = Enum.GetValues(typeof(ActionTypes))
                    .Cast<ActionTypes>()
                    .Select(e => new {
                        Id = (int)e,
                        Name = e.ToString() // Vraća "Other", "NightOut", "SportEvent"...
                    });

            return Ok(types);
        }
    }
}