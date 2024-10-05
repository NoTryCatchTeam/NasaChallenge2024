import * as Three from "three";
import * as Addons from "three/addons";
import { BaseSystem, SolarSystem } from "./solarSystem";
import { ExoplanetSystemData, ExoplanetSystem } from "./exoplanetSystem";

const initialSceneAngle = -160;

let isInitialized = false;
let scene: Three.Scene;
let sceneCamera: SceneCamera;
let activeSystem: BaseSystem;
let solarSystem: SolarSystem;
let exoplanetSystem: ExoplanetSystem;
let isFocusOnScene: boolean;
let focusedCameraTarget: Three.Vector3;
let mouseCoordinates = { x: .5, y: .5 };

declare global {
    var isDebug: boolean;
}

export async function initScene(
    canvasId: string,
    initialExoplanet: ExoplanetSystemData = null,
    isDebug: boolean = false) {

    if (isInitialized) {
        return;
    }

    globalThis.isDebug = isDebug;

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
        const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
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

    if (initialExoplanet != null) {
        await showExoplanetSystemAsync(initialExoplanet, false);
    }
    else {
        showSolarSystemAsync(false);
    }

    window.addEventListener("mousemove", onMouseMove, false);

    setIsFocusOnScene(false);

    // Start render loop
    startRenderLoop(renderer);
}

export async function showExoplanetSystemAsync(data: ExoplanetSystemData, isTargetStar: boolean) {

    solarSystem.hide();
    exoplanetSystem.show();

    await exoplanetSystem.prepareAsync(data);

    activeSystem = exoplanetSystem;

    calculateCameraPosition(isTargetStar);
}

export function showSolarSystemAsync(isTargetStar: boolean) {

    exoplanetSystem.hide();
    solarSystem.show();

    activeSystem = solarSystem;

    calculateCameraPosition(isTargetStar);
}

export function setIsFocusOnScene(isFocus: boolean) {

    isFocusOnScene = isFocus;
    sceneCamera.Controls.enabled = isFocusOnScene;
    calculateCameraPosition(false);
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
        exoplanetSystem.animate(time);

        if (!isFocusOnScene) {
            const currentTarget = sceneCamera.Controls.target;

            // Y dolly
            const newTarget = new Three.Vector3(
                currentTarget.x + (.5 - mouseCoordinates.x) / 100,
                currentTarget.y + (.5 - mouseCoordinates.y) / 100,
                currentTarget.z + (.5 - mouseCoordinates.x) / 100
            );

            if (Math.abs(focusedCameraTarget.x - newTarget.x) <= activeSystem.getPlanetRadius() / 10) {
                currentTarget.x = newTarget.x;
            }

            if (Math.abs(focusedCameraTarget.y - newTarget.y) <= activeSystem.getPlanetRadius() / 10) {
                currentTarget.y = newTarget.y;
            }

            if (Math.abs(focusedCameraTarget.z - newTarget.z) <= activeSystem.getPlanetRadius() / 10) {
                currentTarget.z = newTarget.z;
            }

            sceneCamera.Controls.target.copy(currentTarget);
        }

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

function calculateCameraPosition(isTargetStar: boolean) {
    const targetWorldPos = (isTargetStar ? activeSystem.Star : activeSystem.Planet).getWorldPosition(new Three.Vector3());
    const cameraTargetOffset = isTargetStar ? activeSystem.getStarRadius() : activeSystem.getPlanetRadius();

    // Angle from positive Z in XZ plane
    let xOffset = 2 * cameraTargetOffset * Math.sin(initialSceneAngle * Math.PI / 180);
    let zOffset = 2 * cameraTargetOffset * Math.cos(initialSceneAngle * Math.PI / 180);

    let focusDelta = { x: 0, z: 0 };

    if (!isFocusOnScene) {
        const vectorMovementAngle = 90 - (180 - Math.abs(initialSceneAngle));

        focusDelta.x = activeSystem.getPlanetRadius() * Math.sin(vectorMovementAngle * Math.PI / 180);
        focusDelta.z = activeSystem.getPlanetRadius() * Math.cos(vectorMovementAngle * Math.PI / 180);
    }

    sceneCamera.Camera.position.set(targetWorldPos.x + xOffset - focusDelta.x, targetWorldPos.y, targetWorldPos.z + zOffset + focusDelta.z);
    sceneCamera.Controls.target.set(targetWorldPos.x - focusDelta.x, targetWorldPos.y, targetWorldPos.z + focusDelta.z);
    focusedCameraTarget = sceneCamera.Controls.target.clone();
}

function onMouseMove(ev: MouseEvent) {
    mouseCoordinates.x = ev.clientX / window.innerWidth;
    mouseCoordinates.y = ev.clientY / window.innerHeight;
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
    private sceneGroupXPositionIncrementor = 10000;

    positionGroup(group: Three.Object3D) {
        group.position.set(this.sceneGroupXPosition++ * this.sceneGroupXPositionIncrementor, 0, 0);
    }
}
