import * as THREE from "three";
import { BufferGeometry, Material } from "three";
import Building from "./../../../../strategy-common/dataClasses/Building";
export default abstract class BuildingMesh extends THREE.Mesh {

    buildingData: Building;
    height: number;

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

    abstract setOpponentsOwnership(): void;
}