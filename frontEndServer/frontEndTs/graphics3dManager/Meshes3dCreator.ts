import { Service } from "typedi";
import BuildingsTypes from "./../../../../strategy-common/dataClasses/buildings/BuildingsTypes";
import MainBuildingMesh from "../meshes/buildingMeshes/MainBuildingMesh";
import Building from "./../../../../strategy-common/dataClasses/Building";

/**
 * Retrieves 3d Meshes of given data classes.
 */
@Service()
export default class Meshes3dCreator {

    /**
     * Creates BuildingMesh of served Building type.
     * @param building type of {@link Building}
     * @returns new {@link BuildingMesh} 
     */
    getDistinguishedTypeBuildingMesh = (building: Building) => {
        switch (building.type) {
            case BuildingsTypes.MAIN:
                return new MainBuildingMesh(building);
            default: throw new Error("Such a Building type as " + building.type + " does not exist.");
        }
    };
}