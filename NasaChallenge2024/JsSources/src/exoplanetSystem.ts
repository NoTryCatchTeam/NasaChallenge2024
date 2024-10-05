import * as Three from "three";

export class ExoplanetSystem extends Three.Group {

    constructor() {
        super();
    }

    public Star: Three.Mesh<Three.SphereGeometry, Three.MeshPhongMaterial>;

    public Planet: Three.Mesh<Three.SphereGeometry, Three.MeshPhongMaterial>;

    private light: Three.PointLight;

    async initAsync() {

        // 1 Sun radius
        const starRadius = 1;
        // 1 Earth radius
        const planetRadius = 1;

        // Star
        {
            const geometry = new Three.SphereGeometry(starRadius, 32, 32);

            const texture = await new Three.TextureLoader().loadAsync("images/image_texture_sun.jpg");
            texture.colorSpace = Three.SRGBColorSpace;

            const material = new Three.MeshPhongMaterial({
                emissiveMap: texture,
                emissive: "#ffffff"
            });

            let mesh = new Three.Mesh(geometry, material);
            this.add(mesh);
            this.Star = mesh;

            const axes = new Three.AxesHelper(starRadius);
            (axes.material as Three.Material).depthTest = false;
            axes.renderOrder = 1;

            mesh.add(axes);

            this.light = new Three.PointLight("#ffffff", 1000);
            // this.light.position.set(planetOrbitDistance - planetRadius * 20, 0, 0);
            this.add(this.light);
        }

        // Planet
        {
            const geometry = new Three.SphereGeometry(planetRadius, 32, 32);

            const texture = await new Three.TextureLoader().loadAsync("images/image_texture_earth_daymap.jpg");
            texture.colorSpace = Three.SRGBColorSpace;

            const material = new Three.MeshPhongMaterial({
                map: texture
            });

            let mesh = new Three.Mesh(geometry, material);
            this.add(mesh);
            this.Planet = mesh;

            const axes = new Three.AxesHelper(planetRadius);
            (axes.material as Three.Material).depthTest = false;
            axes.renderOrder = 1;

            mesh.add(axes);
        }
    }

    animate(time: number) {
        time *= 0.001;

        this.Planet.setRotationFromAxisAngle(new Three.Vector3(0, 1, 0), time * 0.1);
        this.Star.setRotationFromAxisAngle(new Three.Vector3(0, 1, 0), time * 0.01);
    }

    async prepare(data: ExoplanetSystemData) {

        // Prepare star
        {
            const currentScale = this.Star.scale;

            // Scale factor is 'new star scale' * 1 / 'current star scale'
            const scaleFactor = data.Star.SunRadius / currentScale.x;
            this.Star.scale.set(scaleFactor, scaleFactor, scaleFactor);

            const texture = await new Three.TextureLoader().loadAsync(data.Star.Texture);
            texture.colorSpace = Three.SRGBColorSpace;

            this.Star.material.emissiveMap = texture;
        }

        // Prepare planet
        {
            const currentScale = this.Planet.scale;

            const scaleFactor = data.Planet.EarthRadius / currentScale.x;
            this.Planet.scale.set(scaleFactor, scaleFactor, scaleFactor);

            const texture = await new Three.TextureLoader().loadAsync(data.Planet.Texture);
            texture.colorSpace = Three.SRGBColorSpace;

            this.Planet.material.map = texture;

            // 1 is 1 AU, so no need to multiply
            this.Planet.position.set(data.Planet.OrbitalRadius, 0, 0);
        }
    }
}

export class ExoplanetSystemData {

    public Star: Star;

    public Planet: Planet;
}

class Star {

    public Id: number;

    public Name: string;

    public SunRadius: number;

    public Texture: string;
}

class Planet {

    public Id: number;

    public Name: string;

    public EarthRadius: number;

    public Texture: string;

    public OrbitalRadius: number;
}