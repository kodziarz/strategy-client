import { Service } from "typedi";
import { fillMapField, instantiateBuilding, instantiateMapField, instantiateOpponent, instantiateUnit } from "../../../../strategy-common/classInstantiatingService";
import Building from "../../../../strategy-common/dataClasses/Building";
import MapField from "../../../../strategy-common/dataClasses/MapField";
import Opponent from "../../../../strategy-common/dataClasses/Opponent";
import Player from "../../../../strategy-common/dataClasses/Player";
import MapChangesMessage from "../../../../strategy-common/socketioMessagesClasses/MapChangesMessage";
import MapFieldPlaceholder from "./MapFieldPlaceholder";
import BuildingWithIdentifiers from "../../../../strategy-common/socketioMessagesClasses/BuildingWithIdentifiers";
import Unit from "../../../../strategy-common/dataClasses/Unit";
import MapFieldIdentifier from "../../../../strategy-common/socketioMessagesClasses/MapFieldIdentifier";

/**
 * Instantiates and binds received JSON data. Used by {@link SocketManager}.
 */
@Service()
export default class DataBinder {

    /**
     * Array of buildings stored to use {@link classInstantiatingService} functions.
     * It is filled by the data from {@link SocketManager} during execution of
     * binidng methods.
     */
    private allBuildings: Building[] = [];
    /**
     * Array of units stored to use {@link classInstantiatingService} functions.
     * It is filled by the data from {@link SocketManager} during execution of
     * binidng methods.
     */
    private allUnits: Unit[] = [];
    /**
     * Array of fields stored to use {@link classInstantiatingService} functions.
     * It is filled by the data from {@link SocketManager} during execution of
     * binidng methods.
     */
    private fieldsMap: MapField[][] | MapFieldPlaceholder[][];

    /**
     * Instantiates and binds data from "init" event. All included
     * {@link Building}s, {@link MapField}s etc. are added to inner tables for
     * binding purposes.
     * @param data Received "init" event data.
     * @returns Modified given object.
     */
    bindInitEventData = (data: Player) => {

        if (this.fieldsMap == undefined) {
            this.fieldsMap = [];
            for (let x = 0; x < data.columns; x++) {
                this.fieldsMap[x] = [];
                for (let y = 0; y < data.rows; y++) {
                    this.fieldsMap[x][y] = new MapFieldPlaceholder();
                }
            }
        }

        let tmp: any = {};
        if (data.observedMapFields) {
            tmp.observedMapFields = data.observedMapFields.map((mapFieldData: any) => {
                let mapField = instantiateMapField(mapFieldData);
                this.fieldsMap[mapField.column][mapField.row] = mapField;
                return mapField;
            });
        }

        let buildingDatasToFill: Building[] = [];
        let unitDatasToFill: Unit[] = [];

        if (data.opponents)
            data.opponents.forEach((opponent) => {
                opponent.buildings = opponent.buildings.map((buildingData) => {
                    let instantiatedBuilding = instantiateBuilding(buildingData);
                    this.allBuildings.push(instantiatedBuilding);
                    buildingDatasToFill.push(instantiatedBuilding);
                    return instantiatedBuilding;
                });
                opponent.units = opponent.units.map((unitData) => {
                    let instantiatedUnit = instantiateUnit(unitData);
                    this.allUnits.push(instantiatedUnit);
                    unitDatasToFill.push(instantiatedUnit);
                    return instantiatedUnit;
                });
            });

        if (data.buildings)
            tmp.buildings = data.buildings.map((buildingData: Building) => {
                let instantiatedBuilding = instantiateBuilding(buildingData);
                this.allBuildings.push(instantiatedBuilding);
                buildingDatasToFill.push(instantiatedBuilding);
                return instantiatedBuilding;
            });

        if (data.units)
            tmp.units = data.units.map((unitData) => {
                let instantiatedUnit = instantiateUnit(unitData);
                this.allUnits.push(instantiatedUnit);
                unitDatasToFill.push(instantiatedUnit);
                return instantiatedUnit;
            });

        if (data.opponents)
            tmp.opponents = data.opponents.map((opponent: Opponent) => {
                return instantiateOpponent(opponent, this.allBuildings);
            });

        if (tmp.observedMapFields)
            tmp.observedMapFields.forEach((mapField: MapField) => {
                fillMapField(mapField, this.allBuildings, this.allUnits);
            });

        buildingDatasToFill.forEach((building: Building) => {
            this.fillBuilding(building);
        });

        unitDatasToFill.forEach((unit: Unit) => {
            this.fillUnit(unit);
        });


        return Object.assign(data, tmp);
    };

    receiveOpponentData = (opponent: Opponent) => {
        return instantiateOpponent(opponent, this.allBuildings);
    };

    receivePlacedBuilding = (placedBuilding: BuildingWithIdentifiers) => {
        let building = instantiateBuilding(placedBuilding);
        this.fillBuilding(building);
        this.allBuildings.push(building);
        return building;
    };

    /**
     * Instantiates and binds (i.e. updates already received) data from "bind"
     * event. All included {@link Building}s, {@link MapField}s etc. are added
     * to inner tables for binding purposes.
     * @param data Received "bind" event data.
     * @returns Object with bound data (not given object).
     */
    bindMapChangesEvent = (data: MapChangesMessage): BoundMapChangesMessage => {

        let boundData: BoundMapChangesMessage = {};

        if (data.changedFields)
            boundData.changedFields = data.changedFields.map((mapFieldData) => {
                let currentFromFieldsMap = this.fieldsMap[mapFieldData.column][mapFieldData.row];
                if (currentFromFieldsMap instanceof MapFieldPlaceholder) {
                    // if field is new for us
                    let mapField = instantiateMapField(mapFieldData);

                    //connect field to buildings waiting for it
                    currentFromFieldsMap.getConnectedBuildings().forEach((building) => {
                        building.occupiedFields.forEach((occupiedField: MapFieldIdentifier, i, array) => {
                            if (
                                occupiedField.column == mapField.column
                                && occupiedField.row == mapField.row
                            ) {
                                array[i] = mapField;
                            }
                        });
                    });

                    //connect field to units waiting for it
                    currentFromFieldsMap.getConnectedUnits().forEach((unit) => {
                        unit.occupiedFields.forEach((occupiedField: MapFieldIdentifier, i, array) => {
                            if (
                                occupiedField.column == mapField.column
                                && occupiedField.row == mapField.row
                            ) {
                                array[i] = mapField;
                            }
                        });
                    });
                    //add to fieldsMap
                    this.fieldsMap[mapFieldData.column][mapFieldData.row] = mapField;
                    return mapField;
                } else {
                    // field is already in fieldsMap
                    return Object.assign(currentFromFieldsMap, mapFieldData);
                    //we damage the currentObject (fill it with identifiers),
                    // but it is going to be filled with real objects anyway.
                }
            });

        if (data.changedBuildings)
            boundData.changedBuildings = data.changedBuildings.map((changedBuilding) => {
                let currentBuilding = this.allBuildings.find((checkedBuilding) => { return checkedBuilding.id == changedBuilding.id; });
                if (!currentBuilding) {
                    //if client has not got the building yet
                    let instantiatedBuilding = instantiateBuilding(changedBuilding);
                    this.allBuildings.push(instantiatedBuilding);
                    return instantiatedBuilding;
                } else {
                    return Object.assign(currentBuilding, changedBuilding);
                    //we damage the currentObject (fill it with identifiers),
                    // but it is going to be filled with real objects anyway.
                }
            });

        if (data.changedUnits)
            boundData.changedUnits = data.changedUnits.map((changedUnit) => {
                let currentUnit = this.allUnits.find((checkedUnit) => { return checkedUnit.id == changedUnit.id; });
                if (!currentUnit) {
                    //if client has not got the building yet
                    let instantiatedUnit = instantiateUnit(changedUnit);
                    this.allUnits.push(instantiatedUnit);
                    return instantiatedUnit;
                } else {
                    return Object.assign(currentUnit, changedUnit);
                    //we damage the currentObject (fill it with identifiers),
                    // but it is going to be filled with real objects anyway.
                }

            });

        if (boundData.changedFields)
            boundData.changedFields.forEach((field) => { fillMapField(field, this.allBuildings, this.allUnits); });

        if (boundData.changedBuildings)
            boundData.changedBuildings.forEach((building) => { this.fillBuilding(building); });

        if (boundData.changedUnits)
            boundData.changedUnits.forEach((unit) => { this.fillUnit(unit); });

        return boundData;
    };

    /**
     * Fills inner data structure with specific objects (like {@link MapField}s).
     * If {@link MapField} has not been sent by sever and it is not known,
     * instance of which class the {@link MapField} sholud be, adds given building
     * to {@link MapFieldPlaceholder}. 
     * @param building Filled Building.
     */
    private fillBuilding = (building: Building) => {
        building.occupiedFields.forEach((fieldData, i, array) => {
            let currentField = this.fieldsMap[fieldData.column][fieldData.row];
            if (currentField instanceof MapFieldPlaceholder)
                currentField.addConnectedBuilding(building);
            else // instanceof MapField
                array[i] = currentField;
        });
    };

    /**
     * Fills inner data structure with specific objects (like {@link MapField}s).
     * If {@link MapField} has not been sent by sever and it is not known,
     * instance of which class the {@link MapField} sholud be, adds given unit
     * to {@link MapFieldPlaceholder}. 
     * @param unit Filled unit.
     */
    private fillUnit = (unit: Unit) => {
        unit.occupiedFields.forEach((fieldData, i, array) => {
            let currentField = this.fieldsMap[fieldData.column][fieldData.row];
            if (currentField instanceof MapFieldPlaceholder)
                currentField.addConnectedUnit(unit);
            else // instanceof MapField
                array[i] = currentField;
        });
    };
}

export interface BoundMapChangesMessage {
    changedFields?: MapField[];
    changedBuildings?: Building[];
    changedUnits?: Unit[];
}