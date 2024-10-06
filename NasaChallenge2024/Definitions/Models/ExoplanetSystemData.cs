 public class ExoplanetSystemData
    {
        public StarData Star { get; set; }

        public PlanetData Planet { get; set; }

        public class StarData
        {
            public int Id { get; set; }

            public string Name { get; set; }

            public float SunRadius { get; set; }

            public string Texture { get; set; }
        }

        public class PlanetData
        {
            public int Id { get; set; }

            public string Name { get; set; }

            public float EarthRadius { get; set; }

            public string Texture { get; set; }

            public float OrbitalRadius { get; set; }
        }
    }