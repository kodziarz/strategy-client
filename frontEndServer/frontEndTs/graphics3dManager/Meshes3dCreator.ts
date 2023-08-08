import { Service } from "typedi";
import BuildingsTypes from "./../../../../strategy-common/dataClasses/buildings/BuildingsTypes";
import MainBuildingMesh from "../meshes/buildingMeshes/MainBuildingMesh";
import Building from "./../../../../strategy-common/dataClasses/Building";
import Unit from "../../../../strategy-common/dataClasses/Unit";
import UnitTypes from "../../../../strategy-common/dataClasses/units/UnitTypes";
import BuilderMesh from "../meshes/unitMeshes/BuilderMesh";

/**
 * Retrieves 3d Meshes of given data classes.
 */
@Service()
export default class Meshes3dCreator {

    /**
     * Creates {@link BuildingMesh} of served Building type.
     * @param building type of {@link Building}.
     * @returns new {@link BuildingMesh}.
     */
    getDistinguishedTypeBuildingMesh = (building: Building) => {
        switch (building.type) {
            case BuildingsTypes.MAIN:
                return new MainBuildingMesh(building);
            default: throw new Error("Such a Building type as " + building.type + " does not exist.");
        }
    };

    /**
     * Creates {@link UnitMesh} of served Unit type.
     * @param unit type of {@link Unit}.
     * @returns new {@link UnitMesh}.
     */
    getDistinguishedTypeUnitMesh = (unit: Unit) => {
        switch (unit.type) {
            case UnitTypes.BUILDER:
                return new BuilderMesh(unit);
            default: throw new Error("Such a Unit type as " + unit.type + " does not exist.");
        }
    };
}