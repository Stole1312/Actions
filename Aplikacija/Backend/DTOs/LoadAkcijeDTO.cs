using System.ComponentModel.DataAnnotations;


// Koristi se za Response od Filter akcije kako bi ima informacije o tome dal
// ima jos akcija koje se treba ucitaju
namespace Backend.Models
{
    public class AkcijePagedResponse
    {
        public List<Akcija>? Akcije { get; set; }
        public string? Poruka { get; set; }
        public required bool ImaJos { get; set; }
    }
}