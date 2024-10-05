namespace NasaChallenge2024.Definitions.Models;

public class SpaceObject
{
    public string Name {get;set;}

    public uint Number {get;set;}

     public uint DiscoveryYear { get; set; }

    public float OrbitalRadius { get; set; } 

    public float OrbitalPeriod { get; set; } 

    public string Status {get;set;}

    public SpaceObjectHost Host {get;set;}

    public string DetectedBy {get;set;}

    public string ObservedBy {get;set;}

}

public class SpaceObjectHost {

    public string Name {get;set;}

    public string SolarTemp {get;set;}

    public string SolarRadius {get;set;}

    public string SolarMass {get;set;}
}