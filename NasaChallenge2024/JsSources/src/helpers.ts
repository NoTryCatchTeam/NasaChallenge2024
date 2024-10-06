import * as Three from "three";

export function addAxesHelper(mesh: Three.Mesh, size: number = 1) {

    const axes = new Three.AxesHelper(size);
    (axes.material as Three.Material).depthTest = false;
    axes.renderOrder = 1;
    mesh.add(axes);
}
