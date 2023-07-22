import * as THREE from "three";
import MapField from "./../../../../strategy-common/dataClasses/MapField";
import SETTINGS from "../SETTINGS";
import MapFieldMesh from "./MapFieldMesh";
export default class GrasslandMesh extends MapFieldMesh {

    mapFieldData: MapField;

    constructor(mapField: MapField) {
        const geometry = new THREE.BoxGeometry(
            SETTINGS.mapFieldSide - 2,
            SETTINGS.mapFieldSide - 2,
            1
        );
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        super(geometry, material);

        this.mapFieldData = mapField;
    }
}