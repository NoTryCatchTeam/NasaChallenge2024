using System.Text.Json.Serialization;

namespace NasaChallenge2024.Definitions.Models;

public class Observatory
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; }

    [JsonPropertyName("established_year")]
    public int? EstablishedYear { get; set; }

    [JsonPropertyName("latitude")]
    public float? Latitude { get; set; }

    [JsonPropertyName("longitude")]
    public float? Longitude { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    [JsonPropertyName("mission_type")]
    public string MissionType { get; set; }

    [JsonPropertyName("launch_date")]
    public DateOnly? LaunchDate { get; set; }

    [JsonPropertyName("destination")]
    public string Destination { get; set; }

    [JsonPropertyName("objective")]
    public string Objective { get; set; }

    [JsonPropertyName("texture_path")]
    public string TexturePath { get; set; }

    [JsonPropertyName("wave_light")]
    public string WaveLight { get; set; }
}
