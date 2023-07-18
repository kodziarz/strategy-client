import Container, { Service } from "typedi";
import Building from "./dataClasses/Building";
import Graphics3dManager from "./Graphics3dManager";
import UIManager from "./UIManager";
import BuildingPlaceIndicator from "./graphics3dManager/BuildingPlaceIndicator";
import BuildingMesh from "./meshes/BuildingMesh";

/**
 * Intercedes between {@link UIManager} and inner, background classes (e.g. {@link Graphics3dManager}).
 */
@Service()
export default class UIInterface {

    constructor(
        private readonly buildingPlaceIndicator: BuildingPlaceIndicator,
        private readonly graphics3dManager: Graphics3dManager
    ) { }

    setGraphics3dManagerRootDiv(domElement: HTMLDivElement) {
        this.graphics3dManager.setRootDiv(domElement);
    }

    /**
     * Lets user indicate the position of building on map.
     * @param building Data of building to build.
     */
    placeBuilding = async (building: Building): Promise<BuildingMesh> => {
        return await this.buildingPlaceIndicator.placeBuilding(building);
    };

}