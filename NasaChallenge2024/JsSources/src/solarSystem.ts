import * as Three from "three";

export class SolarSystem extends Three.Group {

    constructor() {
        super();
    }

    public static getEarthRadiusScene(): number {
        return 1;
    }

    public static getSunRadiusScene(): number {
        return 149 * this.getEarthRadiusScene();
    }

    public static getEarthOrbitDistanceScene(): number {
        return 100 + this.getSunRadiusScene();
    }

    public Sun: Three.Mesh<Three.SphereGeometry>;

    public Earth: Three.Mesh<Three.SphereGeometry>;

    async initAsync() {

        const sunRadius = SolarSystem.getSunRadiusScene();
        const earthRadius = SolarSystem.getEarthRadiusScene();
        const earthOrbitDistance = SolarSystem.getEarthOrbitDistanceScene();

        // Sun
        {
            const geometry = new Three.SphereGeometry(sunRadius, 32, 32);

            const texture = await new Three.TextureLoader().loadAsync("images/image_texture_sun.jpg");
            texture.colorSpace = Three.SRGBColorSpace;

            const material = new Three.MeshPhongMaterial({
                emissiveMap: texture,
                emissive: "#ffffff"
            });

            let mesh = new Three.Mesh(geometry, material);
            this.add(mesh);
            this.Sun = mesh;

            const axes = new Three.AxesHelper(sunRadius);
            (axes.material as Three.Material).depthTest = false;
            axes.renderOrder = 1;

            mesh.add(axes);

            const light = new Three.PointLight("#ffffff", 1000);
            light.position.set(earthOrbitDistance - earthRadius * 20, 0, 0);
            this.add(light);
        }

        // Earth
        {
            const geometry = new Three.SphereGeometry(earthRadius, 32, 32);

            const texture = await new Three.TextureLoader().loadAsync("images/image_texture_earth_daymap.jpg");
            texture.colorSpace = Three.SRGBColorSpace;

            const material = new Three.MeshPhongMaterial({
                map: texture
            });

            let mesh = new Three.Mesh(geometry, material);
            mesh.position.set(earthOrbitDistance, 0, 0);
            this.add(mesh);
            this.Earth = mesh;

            const axes = new Three.AxesHelper(earthRadius);
            (axes.material as Three.Material).depthTest = false;
            axes.renderOrder = 1;

            mesh.add(axes);
        }
    }

    animate(time: number) {
        time *= 0.001;

        this.Earth.setRotationFromAxisAngle(new Three.Vector3(0, 1, 0), time * 0.1);
        this.Sun.setRotationFromAxisAngle(new Three.Vector3(0, 1, 0), time * 0.01);
    }
}