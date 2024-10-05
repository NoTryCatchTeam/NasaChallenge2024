import * as Three from "three";
import * as Addons from "three/addons";

let isInitialized = false;
let scene: Three.Scene;
let sceneCamera: SceneCamera;

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
    }

    // Setup camera
    {
        const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        scene.add(camera);

        const controls = new Addons.OrbitControls(camera, canvas);
        controls.target.set(0, 0, 0);
        controls.enablePan = false;
        controls.dampingFactor = 0.2
        controls.enableDamping = true;

        sceneCamera = new SceneCamera(camera, controls);
    }

    // Start render loop
    startRenderLoop(renderer);
}

function startRenderLoop(renderer: Three.WebGLRenderer) {
    requestAnimationFrame(render);

    function render(time: number) {
        const reducedTime = time * 0.001;

        if (resizeRendererToDisplaySize()) {
            const canvas = renderer.domElement;
            sceneCamera.Camera.aspect = sceneCamera.Camera.aspect = canvas.clientWidth / canvas.clientHeight;
            sceneCamera.Camera.updateProjectionMatrix();
        }
        
        sceneCamera.Controls.update();
        
        renderer.render(scene, sceneCamera.Camera);
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