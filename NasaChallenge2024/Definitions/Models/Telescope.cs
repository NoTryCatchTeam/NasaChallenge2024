using System.Text.Json.Serialization;

namespace NasaChallenge2024.Definitions.Models;

public class Telescope
{
    [JsonPropertyName("id")]
    public int? Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("mission_type")]
    public string MissionType { get; set; }

    [JsonPropertyName("launch_date")]
    public DateOnly LaunchDate { get; set; }

    [JsonPropertyName("destination")]
    public string Destination { get; set; }

    [JsonPropertyName("objective")]
    public string Objective { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    [JsonPropertyName("texture_path")]
    public string TexturePath { get; set; }

    [JsonPropertyName("observatory_id")]
    public int? ObservatoryId { get; set; }

    [JsonPropertyName("wave_light")]
    public string WaveLight { get; set; }
}
