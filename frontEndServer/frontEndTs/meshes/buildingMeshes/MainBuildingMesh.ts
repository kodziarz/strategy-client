import * as THREE from "three";
import MainBuilding from "../../../../../strategy-common/dataClasses/buildings/MainBuilding";
// import SETTINGS from "../SETTINGS";
import BuildingMesh from "../BuildingMesh";
export default class MainBuildingMesh extends BuildingMesh {

    // mainBuildingData: MainBuilding;
    constructor(mainBuilding: MainBuilding) {
        const geometry = new THREE.BoxGeometry(
            10, 10, 10
            // SETTINGS.mapFieldSide - 2,
            // SETTINGS.mapFieldSide - 2,
            // 1
        );
        const material = new THREE.MeshBasicMaterial({ color: 0x888888 });
        super(geometry, material, mainBuilding);

        // this.mainBuildingData = mainBuilding;
    }

    setOpponentsOwnership(): void {
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    }
}