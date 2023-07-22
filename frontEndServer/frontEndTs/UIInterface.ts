import Container, { Service } from "typedi";
import Building from "./../../../strategy-common/dataClasses/Building";
import Graphics3dManager from "./Graphics3dManager";
import UIManager from "./UIManager";
import BuildingPlaceIndicator from "./graphics3dManager/BuildingPlaceIndicator";
import BuildingMesh from "./meshes/BuildingMesh";
import SocketManager from "./SocketManager";

/**
 * Intercedes between {@link UIManager} and inner, background classes (e.g. {@link Graphics3dManager}).
 */
@Service()
export default class UIInterface {

    constructor(
        private readonly buildingPlaceIndicator: BuildingPlaceIndicator,
        private readonly graphics3dManager: Graphics3dManager,
        private readonly socketManager: SocketManager
    ) { }

    setGraphics3dManagerRootDiv(domElement: HTMLDivElement) {
        this.graphics3dManager.setRootDiv(domElement);
    }

    /**
     * Lets user indicate the position of building on map.
     * @param building Data of building to build.
     */
    placeBuilding = async (building: Building): Promise<BuildingMesh> => {
        let mesh = await this.buildingPlaceIndicator.placeBuilding(building);
        console.log("Właśnie postawiono budynek: ", mesh);
        this.socketManager.placeBuilding(mesh.buildingData);
        return mesh;
    };

}