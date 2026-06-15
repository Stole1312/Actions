using System.ComponentModel;
using System.Net;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;
using Microsoft.VisualBasic;
using Backend.DTOs;
using System.Runtime.CompilerServices;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ActionController : ControllerBase
    {
        public Backend.Models.AppDBContext Context { get; set; }
        public ActionController(Backend.Models.AppDBContext context)
        {
            Context = context;
        }

        [HttpPost("AddAkcija")]
        public async Task<ActionResult> AddAkcija([FromBody] AddAkcijaDTO akcijaDTO)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(akcijaDTO.Title))
                    return BadRequest("Your action must have a title");
                if (string.IsNullOrWhiteSpace(akcijaDTO.Description))
                    return BadRequest("Your action must have a description");
                if (string.IsNullOrWhiteSpace(akcijaDTO.Location))
                    return BadRequest("Your action must have a location");
                else if(akcijaDTO.DateAndTime.ToUniversalTime() < DateTime.UtcNow)
                    return BadRequest("You cant add an akcija that has already started");

                var producer = await Context.Users.FindAsync(akcijaDTO.ProducerID);
                if(producer == null)
                    return BadRequest($"There is no user with ID: {akcijaDTO.ProducerID}");

                var akcija = new Akcija
                {
                    Title = akcijaDTO.Title,
                    Description = akcijaDTO.Description,
                    Location = akcijaDTO.Location,
                    Type = akcijaDTO.Type,
                    DateAndTime = akcijaDTO.DateAndTime,
                    ProducerID = akcijaDTO.ProducerID,
                    Producer = producer,
                    maxParticipants = (akcijaDTO.maxParticipants == 0 || akcijaDTO.maxParticipants == null) ? 10 : akcijaDTO.maxParticipants,
                    currentNumParticipants = 1,
                    Price = akcijaDTO.Price == null ? 0 : akcijaDTO.Price,
                    Status = 0,
                    Created=akcijaDTO.Created,
                    AverageRating = 0,
                    RatingCount = 0
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
                akcijaUBazi.Type = izmenjenaAkcija.Type ?? akcijaUBazi.Type;
                akcijaUBazi.DateAndTime = izmenjenaAkcija.DateAndTime ?? akcijaUBazi.DateAndTime;
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

        [HttpPost("ApplyAkcija/{akcijaID}/user/{userID}")]
        public async Task<ActionResult> ApplyAkcija(int akcijaID, int userID)
        {
            try
            {
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

                Context.DeoAkcije.AddAsync(deoAkcije);
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
    }
}