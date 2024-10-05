import * as Three from "three";

export class ExoplanetSystem extends Three.Group {

    constructor() {
        super();
    }

    public Star: Three.Mesh<Three.SphereGeometry>;

    public Planet: Three.Mesh<Three.SphereGeometry>;

    async initAsync() {

        const starRadius = 10;
        const planetRadius = 1;
        const planetOrbitDistance = 15;

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

            const light = new Three.PointLight("#ffffff", 1000);
            light.position.set(planetOrbitDistance - planetRadius * 20, 0, 0);
            this.add(light);
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
            mesh.position.set(planetOrbitDistance, 0, 0);
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
}