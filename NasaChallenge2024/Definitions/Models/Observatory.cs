using System.Text.Json.Serialization;

namespace NasaChallenge2024.Definitions.Models;

public class Observatory
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("established_year")]
    public int EstablishedYear { get; set; }

    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    [JsonPropertyName("telescope_ids")]
    public IEnumerable<int> TelescopeIds { get; set; }
}
