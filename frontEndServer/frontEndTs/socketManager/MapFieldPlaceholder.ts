import Building from "../../../../strategy-common/dataClasses/Building";
import MapField from "../../../../strategy-common/dataClasses/MapField";
import Unit from "../../../../strategy-common/dataClasses/Unit";

/** */
export default class MapFieldPlaceholder {
    private connectedBuildings: Building[] = [];
    private connectedUnits: Unit[] = [];
    private mapFieldHolders: MapFieldHolder[];

    fillConnectedObjects = (mapField: MapField) => {
        this.connectedBuildings.forEach((building) => {
            building.occupiedFields.push(mapField);
        });
        this.connectedUnits.forEach((unit) => {
            unit.occupiedFields.push(mapField);
        });

        this.mapFieldHolders.forEach((holder) => {
            holder.replaceMapFieldPlaceHolder(this, mapField);
        });

    };

    /**
     * Subscribes {@link MapFieldPlaceholder} to fill given object with actual
     * {@link MapField} when it will be available.
     * @param mapFieldHolder Object, which contains {@link MapField} and holds
     * currently a {@link MapFieldPlaceholder}.
     */
    subscribe = (mapFieldHolder: MapFieldHolder) => {
        this.mapFieldHolders.push(mapFieldHolder);
    };

    addConnectedBuilding = (building: Building) => {
        this.connectedBuildings.push(building);
    };

    addConnectedUnit = (unit: Unit) => {
        this.connectedUnits.push(unit);
    };
}

export interface MapFieldHolder {
    /**
     * Replaces holded {@link MapFieldPlaceholder} with actual {@link MapField}.
     * @param placeHolder Placeholder, which is going to be replaced by actual
     * {@link MapField}.
     * @param actualMapField Field to replace {@link MapFieldPlaceholder}.
     */
    replaceMapFieldPlaceHolder: (
        placeHolder: MapFieldPlaceholder,
        actualMapField: MapField
    ) => void;
}