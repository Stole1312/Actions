namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ActionController : ControllerBase
    {
        public Backend.Models.ActionContext Context{get;set;}
        public ActionController(Backend.Models.ActionContext context)
        {
            Context = context;
        }

        [HttpPost("AddAkcija")]
        public async Task<ActionResult> AddAkcija([FromBody] Akcija akcija)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(akcija.Title))
                    return BadRequest("Your action must have a title");
                if (string.IsNullOrWhiteSpace(akcija.Description))
                    return BadRequest("Your action must have a description");
                if (string.IsNullOrWhiteSpace(akcija.Location))
                    return BadRequest("Your action must have a location");

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
        public async Task<ActionResult> DeleteAction([FromBody]int id)
        {
            try
            {
                var akcija = await Context.Akcije.FindAsync(id);

                if(akcija==null)
                    return BadRequest($"There is no Akcija with ID: {id}");

                Context.Akcije.Remove(akcija);
                await Context.SaveChangesAsync();

                return Ok($"Akcija with ID: {id} has been deleted");
            }
            catch(Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("EditAkcija")]
        public async Task<ActionResult> EditAction([FromBody] Akcija izmenjenaAkcija)
        {
            try
            {
                var akcijaUBazi = await Context.Akcije.FindAsync(izmenjenaAkcija.ID);

                if (akcijaUBazi == null)
                    return NotFound($"Akcija with ID {izmenjenaAkcija.ID} was not found.");

                akcijaUBazi.Title = izmenjenaAkcija.Title;
                akcijaUBazi.Description = izmenjenaAkcija.Description;
                akcijaUBazi.Location = izmenjenaAkcija.Location;
                akcijaUBazi.Type = izmenjenaAkcija.Type;
                akcijaUBazi.DateAndTime = izmenjenaAkcija.DateAndTime;
                akcijaUBazi.maxParticipants = izmenjenaAkcija.maxParticipants;
                akcijaUBazi.Price = izmenjenaAkcija.Price;

                await Context.SaveChangesAsync();

                return Ok($"Akcija with ID: {akcijaUBazi.ID} have been edited");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}