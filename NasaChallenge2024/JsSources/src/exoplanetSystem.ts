import * as Three from "three";
import { BaseSystem, SolarSystem } from "./solarSystem";
import * as Helpers from "./helpers";

export class ExoplanetSystem extends BaseSystem {

    constructor() {
        super();
    }

    private light: Three.PointLight;

    getStarRadius(): number {
        return this.Star.scale.x;
    }

    getPlanetRadius(): number {
        return this.Planet.scale.x;
    }

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

            this.light = new Three.PointLight("#ffffff", 1, 0, 0.8);
            this.add(this.light);

            if (globalThis.isDebug) {
                Helpers.addAxesHelper(mesh, starRadius);
            }
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

            if (globalThis.isDebug) {
                Helpers.addAxesHelper(mesh, planetRadius);
            }
        }
    }

    animate(time: number) {
        time *= 0.001;

        this.Planet.setRotationFromAxisAngle(new Three.Vector3(0, 1, 0), time * 0.1);
        this.Star.setRotationFromAxisAngle(new Three.Vector3(0, 1, 0), time * 0.01);
    }

    async prepareAsync(data: ExoplanetSystemData) {

        // Prepare star
        {
            // Scale factor is 'new star scale' * 1 / 'current star scale'
            const newScale = data.star.sunRadius * SolarSystem.getSunRadius();
            this.Star.scale.set(newScale, newScale, newScale);

            const texture = await new Three.TextureLoader().loadAsync(data.star.texture);
            texture.colorSpace = Three.SRGBColorSpace;

            this.Star.material.emissiveMap = texture;
        }

        // Prepare planet
        {
            const newScale = data.planet.earthRadius * SolarSystem.getEarthRadius();
            this.Planet.scale.set(newScale, newScale, newScale);

            const texture = await new Three.TextureLoader().loadAsync(data.planet.texture);
            texture.colorSpace = Three.SRGBColorSpace;

            this.Planet.material.map = texture;

            const starSizeToPlanetOrbitRadius = data.star.sunRadius / data.planet.orbitalRadius;
            const planetOrbit = starSizeToPlanetOrbitRadius > 1 && starSizeToPlanetOrbitRadius <= 4 ?
                data.planet.orbitalRadius * SolarSystem.getEarthOrbitalRadius() + this.getStarRadius() + this.getPlanetRadius() :
                (this.getStarRadius() + this.getPlanetRadius()) * 2;

            this.Planet.position.set(
                planetOrbit,
                0,
                0);

            this.light.intensity = planetOrbit;
        }
    }

    show() {
        this.light.decay = 0.8;
    }

    hide() {
        this.light.decay = 100;
    }
}

export class ExoplanetSystemData {

    public star: Star;

    public planet: Planet;
}

class Star {

    public id: number;

    public name: string;

    public sunRadius: number;

    public texture: string;
}

class Planet {

    public id: number;

    public name: string;

    public earthRadius: number;

    public texture: string;

    public orbitalRadius: number;
}