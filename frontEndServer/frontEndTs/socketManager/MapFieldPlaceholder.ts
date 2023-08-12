import Building from "../../../../strategy-common/dataClasses/Building";
import MapField from "../../../../strategy-common/dataClasses/MapField";
import Unit from "../../../../strategy-common/dataClasses/Unit";

/** */
export default class MapFieldPlaceholder {
    private connectedBuildings: Building[] = [];
    private connectedUnits: Unit[] = [];

    fillConnectiedObjects = (mapField: MapField) => {
        this.connectedBuildings.forEach((building) => {
            building.occupiedFields.push(mapField);
        });
        this.connectedUnits.forEach((unit) => {
            unit.occupiedFields.push(mapField);
        });

    };

    addConnectedBuilding = (building: Building) => {
        this.connectedBuildings.push(building);
    };

    addConnectedUnit = (unit: Unit) => {
        this.connectedUnits.push(unit);
    };
}