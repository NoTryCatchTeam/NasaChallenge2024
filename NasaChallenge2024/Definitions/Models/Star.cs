using System.Text.Json.Serialization;

namespace NasaChallenge2024.Definitions.Models;

public class Star
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("sun_radius")]
    public float? SunRadius { get; set; }

    [JsonPropertyName("sun_mass")]
    public float? SunMass { get; set; }

    [JsonPropertyName("texture_path")]
    public string TexturePath { get; set; }

    [JsonPropertyName("exoplanet_ids")]
    public IEnumerable<int> ExoplanetIds { get; set; }
}
