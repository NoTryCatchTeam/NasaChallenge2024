import * as Three from "three";
import * as Addons from "three/addons";
import * as Tween from "@tweenjs/tween.js";

import { BaseSystem, SolarSystem } from "./solarSystem";
import { ExoplanetSystemData, ExoplanetSystem } from "./exoplanetSystem";
import { SceneCamera } from "./sceneCamera";
import * as Observatories from "./observatories";

const initialSceneAngle = -160;

let isInitialized = false;

let canvas: HTMLElement;
let observatoriesWrapper: HTMLElement;

let renderer: Three.WebGLRenderer;
let scene: Three.Scene;
let sceneCamera: SceneCamera;
let sceneState: SceneState;
let mouseCoordinates = { x: .5, y: .5 };

// Star systems
let activeSystem: BaseSystem;
let solarSystem: SolarSystem;
let exoplanetSystem: ExoplanetSystem;

declare global {
    var isDebug: boolean;
    var dotNet: any;
}

export async function initHomeScene(
    canvasId: string,
    data: ExoplanetSystemData,
    isDebug: boolean = false): Promise<boolean> {

    if (isInitialized) {
        return false;
    }

    isInitialized = true;

    await prepareScene(canvasId, isDebug);

    await showHomeStateAsync(data);

    startRenderLoop(renderer);

    return true;
}

export async function initObservatoriesScene(
    canvasId: string,
    data: Observatories.Observatory[],
    isDebug: boolean = false): Promise<boolean> {

    if (isInitialized) {
        return false;
    }

    isInitialized = true;

    await prepareScene(canvasId, isDebug);

    Observatories.addObservatoriesData(data);
    Observatories.renderObservatories(observatoriesWrapper, solarSystem);
    await showObservatoriesStateAsync(true, false);

    startRenderLoop(renderer);

    return true;
}

// Home state
export async function showHomeStateAsync(data: ExoplanetSystemData, isAnimated: boolean = true) {
    await showExoplanetSystemAsync(data);
    sceneCamera.resetControlsDistance();

    sceneCamera.IsDirectOnPlanet = false;
    setIsFocusActivePlanetOnScene(false, isAnimated);

    changeState(SceneState.Home);
}

// Observatories state
export async function showObservatoriesStateAsync(isPlanet: boolean, isAnimated: boolean = true) {
    showSolarSystem();

    const planetRadius = activeSystem.getPlanetRadius();

    sceneCamera.Controls.minDistance = planetRadius * 1.5;
    sceneCamera.Controls.maxDistance = planetRadius * 2;

    if (isPlanet) {
        sceneCamera.IsDirectOnPlanet = true;
        setIsFocusActivePlanetOnScene(true, isAnimated);
    } else {
        sceneCamera.IsFocusOnScene = false;

        const targetWorldPos = activeSystem.Planet.getWorldPosition(new Three.Vector3());

        var newCameraPosition = new Three.Vector3(targetWorldPos.x - planetRadius * 2, targetWorldPos.y, targetWorldPos.z);
        var targetDeltaY = (targetWorldPos.x - newCameraPosition.x) * Math.tan(45 * Math.PI / 180);
        var newCameraLookAt = new Three.Vector3(targetWorldPos.x, targetWorldPos.y + targetDeltaY, targetWorldPos.z);

        sceneCamera.changeCameraSettings(newCameraPosition, newCameraLookAt, isAnimated);
    }

    changeState(isPlanet ? SceneState.ObservatoryEarth : SceneState.ObservatorySpace);
}

export async function showObservatoriesStateFirstTimeAsync(data: Observatories.Observatory[]) {
    Observatories.addObservatoriesData(data);
    Observatories.renderObservatories(observatoriesWrapper, solarSystem);
    await showObservatoriesStateAsync(true, false);
}

// Changes focus on planet: focus - move planet in the center, allow gestures; unfocus - move planet aside, disable gestures
export function setIsFocusActivePlanetOnScene(isFocus: boolean, isAnimated: boolean = true) {
    sceneCamera.IsFocusOnScene = isFocus;
    const newCameraSettings = calculateCameraSettingsForActiveSystem(sceneCamera.IsDirectOnPlanet);
    sceneCamera.changeCameraSettings(newCameraSettings.position, newCameraSettings.lookAt, isAnimated);
}

export function passDotNet(dotNet: any){
    globalThis.dotNet = dotNet;
}

async function showExoplanetSystemAsync(data: ExoplanetSystemData) {
    solarSystem.hide();
    exoplanetSystem.show();

    await exoplanetSystem.prepareAsync(data);

    activeSystem = exoplanetSystem;
}

function showSolarSystem() {
    exoplanetSystem.hide();
    solarSystem.show();

    activeSystem = solarSystem;
}

function changeState(newState: SceneState) {
    sceneState = newState;

    observatoriesWrapper.style.display = sceneState != SceneState.ObservatoryEarth ? 'none' : '';
}

async function prepareScene(
    canvasId: string,
    isDebug: boolean = false) {

    globalThis.isDebug = isDebug;

    canvas = document.querySelector(canvasId);
    observatoriesWrapper = document.querySelector('#earth-observatories-labels');

    // Create renderer
    renderer = new Three.WebGLRenderer({
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
    }

    // Setup camera
    {
        const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        scene.add(camera);

        const controls = new Addons.OrbitControls(camera, canvas);
        controls.target.set(0, 0, 0);
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

    window.addEventListener("mousemove", onMouseMove, false);
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

        if (sceneState != SceneState.ObservatoryEarth) {
            solarSystem.animate(time);
        }

        exoplanetSystem.animate(time);

        // If camera is not animating then use other existed calculations and changes
        if (!sceneCamera.CameraAnimator?.update(time)) {
            if (!sceneCamera.IsFocusOnScene) {
                const currentTarget = sceneCamera.Controls.target;

                const newTarget = new Three.Vector3(
                    currentTarget.x + (Math.abs(currentTarget.z - sceneCamera.Camera.position.z) < 1e7 ? 0 : (.5 - mouseCoordinates.x) / 100),
                    currentTarget.y + (.5 - mouseCoordinates.y) / 100,
                    currentTarget.z + (mouseCoordinates.x - .5) / 100
                );

                if (Math.abs(sceneCamera.FocusedCameraTarget.x - newTarget.x) <= activeSystem.getPlanetRadius() / 10) {
                    currentTarget.x = newTarget.x;
                }

                if (Math.abs(sceneCamera.FocusedCameraTarget.y - newTarget.y) <= activeSystem.getPlanetRadius() / 10) {
                    currentTarget.y = newTarget.y;
                }

                if (Math.abs(sceneCamera.FocusedCameraTarget.z - newTarget.z) <= activeSystem.getPlanetRadius() / 10) {
                    currentTarget.z = newTarget.z;
                }

                sceneCamera.Controls.target.copy(currentTarget);
            }

            sceneCamera.Controls.update();
        }

        if (sceneState == SceneState.ObservatoryEarth) {
            Observatories.updateObservatoriesLabels(canvas, sceneCamera.Camera, solarSystem);
        }

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

function calculateCameraSettingsForActiveSystem(isDirect: boolean): { position: Three.Vector3, lookAt: Three.Vector3 } {
    const targetWorldPos = activeSystem.Planet.getWorldPosition(new Three.Vector3());
    const cameraTargetOffset = activeSystem.getPlanetRadius();

    // For direct place camera on the bright side of the planet; overwise calculate additional delta. Angle is calculated from positive Z in XZ plane
    let xOffset = 2 * cameraTargetOffset * (isDirect ? -1 : Math.sin(initialSceneAngle * Math.PI / 180));
    let zOffset = isDirect ? 0 : 2 * cameraTargetOffset * Math.cos(initialSceneAngle * Math.PI / 180);

    let focusDelta = { x: 0, z: 0 };

    // Calculate focus delta only
    if (!isDirect && !sceneCamera.IsFocusOnScene) {
        const vectorMovementAngle = 90 - (180 - Math.abs(initialSceneAngle));

        focusDelta.x = activeSystem.getPlanetRadius() * Math.sin(vectorMovementAngle * Math.PI / 180);
        focusDelta.z = activeSystem.getPlanetRadius() * Math.cos(vectorMovementAngle * Math.PI / 180);
    }

    var newCameraPosition = new Three.Vector3(
        targetWorldPos.x + xOffset - focusDelta.x,
        targetWorldPos.y,
        targetWorldPos.z + zOffset + focusDelta.z
    );

    var newCameraLookAt = new Three.Vector3(
        targetWorldPos.x - focusDelta.x,
        targetWorldPos.y,
        targetWorldPos.z + focusDelta.z
    );

    return { position: newCameraPosition, lookAt: newCameraLookAt };
}

function onMouseMove(ev: MouseEvent) {
    mouseCoordinates.x = ev.clientX / window.innerWidth;
    mouseCoordinates.y = ev.clientY / window.innerHeight;
}

class SceneGroupPositioner {

    private sceneGroupXPosition = 0;
    private sceneGroupXPositionIncrementor = 10000;

    positionGroup(group: Three.Object3D) {
        group.position.set(this.sceneGroupXPosition++ * this.sceneGroupXPositionIncrementor, 0, 0);
    }
}

enum SceneState {
    Home,
    ObservatoryEarth,
    ObservatorySpace
}

