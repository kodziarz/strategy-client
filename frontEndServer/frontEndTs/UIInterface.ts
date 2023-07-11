import Container, { Service } from "typedi";
import Building from "./dataClasses/Building";
import Graphics3dManager from "./Graphics3dManager";
import UIManager from "./UIManager";

/**
 * Intercedes between {@link UIManager} and inner, background classes (e.g. {@link Graphics3dManager}).
 */
@Service()
export default class UIInterface {

    private readonly graphics3dManager: Graphics3dManager;
    private readonly uiManager: UIManager;

    constructor(
        // private readonly graphics3dManager: Graphics3dManager,
        // private readonly uiManager: UIManager
    ) {
        this.graphics3dManager = Container.get(Graphics3dManager);
        this.uiManager = Container.get(UIManager);
    }

    setGraphics3dManagerRootDiv(domElement: HTMLDivElement) {
        this.graphics3dManager.setRootDiv(domElement);
    }

    /**
     * Lets user indicate the position of building on map.
     * @param building Data of building to build.
     */
    placeBuilding = async (building: Building): Promise<void> => {
        console.log("place building")
    };

}