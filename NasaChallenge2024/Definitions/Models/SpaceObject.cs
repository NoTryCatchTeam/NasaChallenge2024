namespace NasaChallenge2024.Definitions.Models;

public class SpaceObject
{
    public string Name {get;set;}

     public uint DiscoveryYear { get; set; }

    public float OrbitalRadius { get; set; } 

    public float OrbitalPeriod { get; set; } 

    public SpaceObjectHost Host {get;set;}

}

public class SpaceObjectHost {

    public string Name {get;set;}
}