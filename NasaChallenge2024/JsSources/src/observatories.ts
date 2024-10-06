import * as Three from "three";

import { SolarSystem } from "./solarSystem";

let isInitialized = false;
let observatories: Observatory[] = [];

export function renderObservatories(
    data: Observatory[],
    observatoriesWrapper: HTMLElement,
    solarSystem: SolarSystem) {

    if (isInitialized) {
        return;
    }

    isInitialized = true;

    observatories = data;

    const longFudge = Math.PI * 1.5;
    const latFudge = Math.PI;

    // Helpers to position labels
    const longHelper = new Three.Object3D();
    solarSystem.Planet.add(longHelper);

    const latHelper = new Three.Object3D();
    longHelper.add(latHelper);

    // The position helper moves the object to the edge of the sphere
    const positionHelper = new Three.Object3D();

    positionHelper.position.z = solarSystem.getPlanetRadius();
    latHelper.add(positionHelper);

    for (const observatory of observatories) {

        longHelper.rotation.y = Three.MathUtils.degToRad(observatory.longitude) + longFudge;
        latHelper.rotation.x = Three.MathUtils.degToRad(observatory.latitude) + latFudge;

        positionHelper.updateWorldMatrix(true, false);
        observatory.position = positionHelper.getWorldPosition(new Three.Vector3());

        const element = document.createElement('div');
        element.addEventListener(
            "click",
            function (e) {
                globalThis.dotNet.invokeMethodAsync('OnEarthLabelClicked', observatory.id);
            },
            false);

        const img = document.createElement('img');
        img.src = "images/ic_observatory_pin.svg";
        element.appendChild(img);

        const p = document.createElement('p');
        p.textContent = observatory.name;
        element.appendChild(p);

        observatoriesWrapper.appendChild(element);
        observatory.element = element;
    }
}

export function updateObservatoriesLabels(
    canvas: HTMLElement,
    camera: Three.Camera,
    solarSystem: SolarSystem) {

    const tempV = new Three.Vector3();
    const planetCenter = solarSystem.Planet.getWorldPosition(new Three.Vector3());

    for (const observatory of observatories) {

        const { name, position, element } = observatory;

        const cameraLookVector = new Three.Vector3().subVectors(planetCenter, camera.position).normalize();

        const pointVector = new Three.Vector3().subVectors(position, planetCenter).normalize();

        const dot = cameraLookVector.dot(pointVector);

        if (dot > -0.5) {
            element.style.display = 'none';

            continue;
        }

        element.style.display = '';
        // element.style.opacity = 

        tempV.copy(position);
        tempV.project(camera);

        const x = (tempV.x * .5 + .5) * canvas.clientWidth;
        const y = (tempV.y * - .5 + .5) * canvas.clientHeight;

        element.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;

        element.style.zIndex = ((- tempV.z * .5 + .5) * 100000 | 0).toString();
    }
}

export class Observatory {

    public id: string;

    public name: string;

    public latitude: number;

    public longitude: number;

    public position: Three.Vector3;

    public element: HTMLDivElement;
}