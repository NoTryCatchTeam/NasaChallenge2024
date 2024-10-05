using System.Text.Json.Serialization;

namespace NasaChallenge2024.Definitions.Models;

public class TravelType
{
    [JsonPropertyName("type")]
    public string Type { get; set; }

    [JsonPropertyName("speed")]
    public int? Speed { get; set; }
}
