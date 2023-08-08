import * as THREE from "three";
import { BufferGeometry, Material } from "three";
import Unit from "../../../../strategy-common/dataClasses/Unit";
export default abstract class UnitMesh extends THREE.Mesh {

    unitData: Unit;
    height: number;

    constructor(geometry: BufferGeometry, material: Material, unit: Unit) {
        super(geometry, material);
        this.unitData = unit;
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