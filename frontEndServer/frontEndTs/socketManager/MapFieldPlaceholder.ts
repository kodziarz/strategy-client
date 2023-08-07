import Building from "../../../../strategy-common/dataClasses/Building";
import Unit from "../../../../strategy-common/dataClasses/Unit";

/** */
export default class MapFieldPlaceholder {
    private connectedBuildings: Building[] = [];
    private connectedUnits: Unit[] = [];

    addConnectedBuilding = (building: Building) => {
        this.connectedBuildings.push(building);
    };

    addConnectedUnit = (unit: Unit) => {
        this.connectedUnits.push(unit);
    };

    /**
     * Gets Connected buildings.
     * @returns Copy of array of connected buildings.
     */
    getConnectedBuildings = () => {
        return [...this.connectedBuildings];
    };

    /**
     * Gets Connected units.
     * @returns Copy of array of connected units.
     */
    getConnectedUnits = () => {
        return [...this.connectedUnits];
    };
}