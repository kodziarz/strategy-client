import Building from "./dataClasses/Building";
import Graphics3dManager from "./Graphics3dManager";

/**Allows player to indicate place for building. */
export default class BuildingPlaceIndicator {

    private eventListener: Function;
    private resolve: Function;
    private reject: Function;

    constructor(
        private readonly graphics3dManager: Graphics3dManager
    ) { }

    placeBuilding = async (building: Building) => {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.eventListener = this.graphics3dManager.addRootDivEventListener("mouseMove", this.onMouseMove)
        })
    }

    onMouseMove = (target: HTMLElement, event: Event) => {

    }

}