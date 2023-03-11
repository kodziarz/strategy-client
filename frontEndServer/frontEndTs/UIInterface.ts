import { Service } from "typedi";
import Building from "./dataClasses/Building";
import Graphics3dManager from "./Graphics3dManager";
import UIManager from "./UIManager";

/**
 * Intercedes between {@link UIManager} and {@link Graphics3dManager}.
 */
@Service()
export default class UIInterface {

    constructor(
        private readonly graphics3dManager: Graphics3dManager,
        private readonly uiManager: UIManager
    ) { }

    /**
     * Lets user indicate the position of building on map.
     * @param building Data of building to build.
     */
    placeBuilding = async (building: Building): Promise<void> => {

    };

}