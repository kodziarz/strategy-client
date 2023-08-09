import * as THREE from "three";
import MainBuilding from "../../../../../strategy-common/dataClasses/buildings/MainBuilding";
// import SETTINGS from "../SETTINGS";
import BuildingMesh from "../BuildingMesh";
export default class MainBuildingMesh extends BuildingMesh {

    // mainBuildingData: MainBuilding;
    constructor(mainBuilding: MainBuilding) {
        const geometry = new THREE.BoxGeometry(
            mainBuilding.width,
            mainBuilding.length,
            10
        );
        const material = new THREE.MeshBasicMaterial({ color: 0x888888 });
        super(geometry, material, mainBuilding);
        this.height = geometry.parameters.depth;
        this.position.set(
            mainBuilding.x,
            mainBuilding.y,
            this.height / 2
        );

        // this.mainBuildingData = mainBuilding;
    }

    setOpponentsOwnership(): void {
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    }
}