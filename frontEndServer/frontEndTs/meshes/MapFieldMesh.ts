import * as THREE from "three";
import { BufferGeometry, Material } from "three";
export default abstract class MapFieldMesh extends THREE.Mesh {

    constructor(geometry: BufferGeometry, material: Material) {
        super(geometry, material);
    }

    abstract setObserved(): void;
    abstract setInvisible(): void;
    abstract setVisited(): void;
}