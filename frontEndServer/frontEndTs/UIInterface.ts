import { Service } from "typedi";
import Building from "./dataClasses/Building";
import Graphics3dManager from "./Graphics3dManager";

/** Intercedes between UI and other singletones. */
@Service()
export default class UIInterface {

    constructor(
        private readonly graphics3dManager: Graphics3dManager
    ) { }

    /**
     * Allows player to indicate place for building.
     * @param building Data of building, which needs to be placed.
     */
    placeBuildingOnMap = async (building: Building): Promise<{ x: number, y: number }> => {

        return { x: 2, y: 3 }
    }

}