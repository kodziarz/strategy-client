import * as THREE from "three";
import { BufferGeometry, Material } from "three";
import Building from "../dataClasses/Building";
export default class BuildingMesh extends THREE.Mesh {
    buildingData: Building;
    constructor(geometry: BufferGeometry, material: Material, building: Building) {
        super(geometry, material);
        this.buildingData = building;
    }

    /**
     * Modifies the mesh to show, that it is only for indication purposes
     * Used by  {@link BuildingPlaceIndicator}.
     */
    setTemporaryMode = () => {
        this.material = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.7
        });
    };
}