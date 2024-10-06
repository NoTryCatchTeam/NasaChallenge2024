import * as Three from "three";
import * as Addons from "three/addons";
import * as Tween from "@tweenjs/tween.js";

export class SceneCamera {
    constructor(camera: Three.PerspectiveCamera, controls: Addons.OrbitControls) {
        this.Camera = camera;
        this.Controls = controls;
    }

    public Camera: Three.PerspectiveCamera;

    public Controls: Addons.OrbitControls;

    public CameraAnimator: Tween.Tween;

    public IsFocusOnScene: boolean;

    public IsDirectOnPlanet: boolean;

    public FocusedCameraTarget: Three.Vector3;

    changeCameraSettings(position: Three.Vector3, lookAt: Three.Vector3, isAnimated: boolean) {
        if (!isAnimated) {
            this.Camera.position.copy(position);
            this.Controls.enabled = this.IsFocusOnScene;

            this.Controls.target.copy(lookAt);
            this.FocusedCameraTarget = lookAt.clone();
        }
        else {
            var currentCameraPosition = {
                x: this.Camera.position.x,
                y: this.Camera.position.y,
                z: this.Camera.position.z
            };

            var currentCameraLookAt = {
                x: this.Controls.target.x,
                y: this.Controls.target.y,
                z: this.Controls.target.z
            };

            var newCameraPosition = { x: position.x, y: position.y, z: position.z };

            var newCameraLookAt = { x: lookAt.x, y: lookAt.y, z: lookAt.z };

            this.CameraAnimator = new Tween.Tween(
                [
                    currentCameraPosition,
                    currentCameraLookAt
                ]);

            this.CameraAnimator.to(
                [
                    newCameraPosition,
                    newCameraLookAt
                ],
                500);

            this.CameraAnimator.onUpdate(() => {
                this.Camera.position.set(currentCameraPosition.x, currentCameraPosition.y, currentCameraPosition.z);
                this.Camera.lookAt(currentCameraLookAt.x, currentCameraLookAt.y, currentCameraLookAt.z);
            });

            this.CameraAnimator.onComplete(() => {
                this.Controls.enabled = this.IsFocusOnScene;

                this.Controls.target.copy(lookAt);
                this.FocusedCameraTarget = lookAt.clone();
            });

            this.CameraAnimator.start();
        }
    }
}