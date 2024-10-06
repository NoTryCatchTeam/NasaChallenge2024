import * as Three from "three";

import { SolarSystem } from "./solarSystem";

let observatories: { name: string, position: Three.Vector3, element: HTMLDivElement }[] = [];

export function initObservatoriesData(
    observatoriesWrapper: HTMLElement,
    solarSystem: SolarSystem) {

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

    const observatoryInfos =
        [
            {
                name: "La Silla Observatory",
                lat: -29.25627,
                long: -70.73805
            },
            {
                name: "Subaru Observatory",
                lat: 19.8255556,
                long: -155.4761111,
            }
        ];

    for (const observatoryInfo of observatoryInfos) {

        const { lat, long, name } = observatoryInfo;

        longHelper.rotation.y = Three.MathUtils.degToRad(long) + longFudge;
        latHelper.rotation.x = Three.MathUtils.degToRad(lat) + latFudge;

        positionHelper.updateWorldMatrix(true, false);
        const position = positionHelper.getWorldPosition(new Three.Vector3());

        const element = document.createElement('div');
        element.textContent = name;
        observatoriesWrapper.appendChild(element);

        observatories.push({ name, position, element });
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