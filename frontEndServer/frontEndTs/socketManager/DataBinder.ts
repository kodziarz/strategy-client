import { Service } from "typedi";
import { fillMapField, instantiateBuilding, instantiateMapField, instantiateOpponent } from "../../../../strategy-common/classInstantiatingService";
import Building from "../../../../strategy-common/dataClasses/Building";
import MapField from "../../../../strategy-common/dataClasses/MapField";
import Opponent from "../../../../strategy-common/dataClasses/Opponent";
import Player from "../../../../strategy-common/dataClasses/Player";
import MapChangesMessage from "../../../../strategy-common/socketioMessagesClasses/MapChangesMessage";
import MapFieldPlaceholder from "./MapFieldPlaceholder";
import BuildingWithIdentifiers from "../../../../strategy-common/socketioMessagesClasses/BuildingWithIdentifiers";

/**
 * Instantiates and binds received JSON data. Used by {@link SocketManager}.
 */
@Service()
export default class DataBinder {

    /**
     * Array of buildings stored to use {@link classInstantiatingService} functions.
     * It is fully managed by {@link SocketManager} which has to intecept needed data.
     */
    private allBuildings: Building[] = [];
    /**
     * Array of fields stored to use {@link classInstantiatingService} functions.
     * It is fully managed by {@link SocketManager} which has to intecept needed data.
     */
    private fieldsMap: MapField[][] | MapFieldPlaceholder[][];

    /**
     * Instantiates and binds data from "map" event. All included
     * {@link Building}s, {@link MapField}s etc. are added to inner table for
     * binding purposes.
     * @param data Received "map" event data.
     * @returns Modified given object.
     */
    bindMapEventData = (data: Player) => {

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

        if (data.opponents)
            data.opponents.forEach((opponent) => {
                opponent.buildings = opponent.buildings.map((buildingData) => {
                    let instantiatedBuilding = instantiateBuilding(buildingData);
                    this.allBuildings.push(instantiatedBuilding);
                    buildingDatasToFill.push(instantiatedBuilding);
                    return instantiatedBuilding;
                });
            });

        if (data.buildings)
            tmp.buildings = data.buildings.map((buildingData: Building) => {
                let instantiatedBuilding = instantiateBuilding(buildingData);
                this.allBuildings.push(instantiatedBuilding);
                buildingDatasToFill.push(instantiatedBuilding);
                return instantiatedBuilding;
            });

        if (data.opponents)
            tmp.opponents = data.opponents.map((opponent: Opponent) => {
                return instantiateOpponent(opponent, this.allBuildings);
            });

        if (tmp.observedMapFields)
            tmp.observedMapFields.forEach((mapField: MapField) => {
                fillMapField(mapField, this.allBuildings);
            });

        buildingDatasToFill.forEach((building: Building) => {
            this.fillBuilding(building);
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

    bindMapChangesEvent = (data: MapChangesMessage): BoundMapChangesMessage => {

        let boundData: BoundMapChangesMessage = {};

        if (data.changedFields)
            boundData.changedFields = data.changedFields.map((mapFieldData) => {
                let currentFromFieldsMap = this.fieldsMap[mapFieldData.column][mapFieldData.row];
                if (currentFromFieldsMap instanceof MapFieldPlaceholder) {
                    // if field is new for us
                    let mapField = instantiateMapField(mapFieldData);

                    //connect map to buildings waiting for it and add to fieldsMap
                    currentFromFieldsMap.getConnectedBuildings().forEach((building) => {
                        building.occupiedFields.find((occupiedField) => {
                            return occupiedField.column == mapField.column
                                && occupiedField.row == mapField.row;
                        });
                    });
                    this.fieldsMap[mapFieldData.column][mapFieldData.row] = mapField;
                    return mapField;
                } else {
                    // field is already in fieldsMap
                    return currentFromFieldsMap;
                }
            });

        if (data.changedBuildings)
            boundData.changedBuildings = data.changedBuildings.map((changedBuilding) => {
                let instantiatedBuilding = instantiateBuilding(changedBuilding);
                this.allBuildings.push(instantiatedBuilding);
                return instantiatedBuilding;
            });

        if (boundData.changedFields)
            boundData.changedFields.forEach((field) => { fillMapField(field, this.allBuildings); });

        if (boundData.changedBuildings)
            boundData.changedBuildings.forEach((building) => { this.fillBuilding(building); });

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
}

export interface BoundMapChangesMessage {
    changedFields?: MapField[];
    changedBuildings?: Building[];
}