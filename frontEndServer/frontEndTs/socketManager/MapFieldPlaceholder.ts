import Building from "../../../../strategy-common/dataClasses/Building";

/** */
export default class MapFieldPlaceholder {
    private connectedBuildings: Building[] = [];

    addConnectedBuilding = (building: Building) => {
        this.connectedBuildings.push(building);
    };

    /**
     * Gets Connected buildings.
     * @returns Copy of array of connected buildings.
     */
    getConnectedBuildings = () => {
        return [...this.connectedBuildings];
    };
}