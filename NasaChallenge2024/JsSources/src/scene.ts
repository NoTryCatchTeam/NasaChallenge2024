import * as Three from "three";
import * as Addons from "three/addons";
import { SolarSystem } from "./solarSystem";
import { ExoplanetSystem } from "./exoplanetSystem";

let isInitialized = false;
let scene: Three.Scene;
let sceneCamera: SceneCamera;
let solarSystem: SolarSystem;
let exoplanetSystem: ExoplanetSystem;

export async function initScene(canvasId: string) {

    if (isInitialized) {
        return;
    }

    isInitialized = true;

    const canvas: HTMLElement = document.querySelector(canvasId);

    // Create renderer
    const renderer = new Three.WebGLRenderer({
        antialias: true,
        canvas: canvas,
        alpha: true,
    });

    renderer.setPixelRatio(window.devicePixelRatio);

    // Setup scene
    {
        scene = new Three.Scene();
        const texture = await new Three.TextureLoader()
            .loadAsync("images/image_background_stars.jpg");
        texture.mapping = Three.EquirectangularReflectionMapping;
        texture.colorSpace = Three.SRGBColorSpace;
        scene.background = texture;
        // scene.background = new Three.Color("#787878");
    }

    // Setup camera
    {
        const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        scene.add(camera);

        const controls = new Addons.OrbitControls(camera, canvas);
        controls.target.set(0, 0, 0);
        // controls.enablePan = false;
        controls.dampingFactor = 0.2
        controls.enableDamping = true;

        sceneCamera = new SceneCamera(camera, controls);
    }

    // Add ambient light
    {
        const light = new Three.AmbientLight("#ffffff", 0.1);
        scene.add(light);
    }

    const sceneGroupsPositioner = new SceneGroupPositioner();

    // Add sun-earth system
    solarSystem = new SolarSystem();
    await solarSystem.initAsync();
    sceneGroupsPositioner.positionGroup(solarSystem);
    scene.add(solarSystem);

    // Add exoplanet system
    exoplanetSystem = new ExoplanetSystem();
    await exoplanetSystem.initAsync();
    sceneGroupsPositioner.positionGroup(exoplanetSystem);
    scene.add(exoplanetSystem);

    const targetWorldPos = solarSystem.Earth.getWorldPosition(new Three.Vector3());
    const cameraTargetOffset = solarSystem.Earth.geometry.parameters.radius;
    sceneCamera.Camera.position.set(targetWorldPos.x - cameraTargetOffset * 2, targetWorldPos.y, targetWorldPos.z);
    sceneCamera.Controls.target.copy(targetWorldPos);

    // Start render loop
    startRenderLoop(renderer);
}

let isTargetingSolarSystem = true;

export function changeSystem() {
    const targetWorldPos = !isTargetingSolarSystem ?
        solarSystem.Earth.getWorldPosition(new Three.Vector3()) :
        exoplanetSystem.Planet.getWorldPosition(new Three.Vector3());
    const cameraTargetOffset = solarSystem.Earth.geometry.parameters.radius;
    sceneCamera.Camera.position.set(targetWorldPos.x - cameraTargetOffset * 2, targetWorldPos.y, targetWorldPos.z);
    sceneCamera.Controls.target.copy(targetWorldPos);
}

function startRenderLoop(renderer: Three.WebGLRenderer) {
    requestAnimationFrame(render);

    function render(time: number) {
        const reducedTime = time * 0.001;

        if (resizeRendererToDisplaySize()) {
            const canvas = renderer.domElement;
            sceneCamera.Camera.aspect = canvas.clientWidth / canvas.clientHeight;
            sceneCamera.Camera.updateProjectionMatrix();
        }

        solarSystem.animate(time);

        sceneCamera.Controls.update();

        renderer.render(scene, sceneCamera.Camera);

        requestAnimationFrame(render);
    }

    function resizeRendererToDisplaySize() {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;

        if (needResize) {
            renderer.setSize(width, height, false);
        }

        return needResize;
    }
}

class SceneCamera {
    constructor(camera: Three.PerspectiveCamera, controls: Addons.OrbitControls) {
        this.Camera = camera;
        this.Controls = controls;
    }

    public Camera: Three.PerspectiveCamera;

    public Controls: Addons.OrbitControls;
}

class SceneGroupPositioner {

    private sceneGroupXPosition = 0;
    private sceneGroupXPositionIncrementor = 1000;

    positionGroup(group: Three.Object3D) {
        group.position.set(this.sceneGroupXPosition++ * this.sceneGroupXPositionIncrementor, 0, 0);
    }
}
