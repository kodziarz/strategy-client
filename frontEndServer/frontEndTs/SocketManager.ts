import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import Container, { Service } from "typedi";
import Building from "./../../../strategy-common/dataClasses/Building";
import Graphics3dManager from "./Graphics3dManager";
import envSettings from '../../settings.json';
import BuildingPlaceIndicator from "./graphics3dManager/BuildingPlaceIndicator";
import Meshes3dCreator from "./graphics3dManager/Meshes3dCreator";
import { instantiateOpponent, instantiateBuilding, instantiateMapField, fillMapField, fillBuilding } from "./../../../strategy-common/classInstantiatingService";
import Player from "./../../../strategy-common/dataClasses/Player";
import Opponent from "../../../strategy-common/dataClasses/Opponent";
import MapField from "../../../strategy-common/dataClasses/MapField";

/**
 * Provides methods for socket communication with server.
 */
@Service()
export default class SocketManager {
    private readonly socket: Socket;
    private player: Player;
    /**
     * Array of buildings stored to use {@link classInstantiatingService} functions.
     * It is fully managed by {@link SocketManager} which has to intecept needed data.
     */
    private allBuildings: Building[] = [];
    /**
     * Array of fields stored to use {@link classInstantiatingService} functions.
     * It is fully managed by {@link SocketManager} which has to intecept needed data.
     */
    private fieldsMap: MapField[][];

    constructor(
        private readonly graphics3dManager: Graphics3dManager,
        private readonly buildingPlaceIndicator: BuildingPlaceIndicator,
        private readonly meshes3dCreator: Meshes3dCreator,
    ) {
        this.socket = io(`ws://${envSettings.serverAddress}`, {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        Authorization: "Bearer " + Cookies.get("token")
                    }
                }
            }
        });
        this.setEventListeners();
        this.player = Container.get(Player);
    }

    /**
     * Sets Socket event listeners therefore invokes respective methods in other
     * classes to handle server's messages. 
     */
    private setEventListeners = () => {
        this.socket.on("connect", () => {
            console.log("uzyskano połączenie z serwerem.");
            this.socket.emit("map");
        });

        this.socket.on("map", (data: Player) => {
            console.log("odebrano wydarzenie map: ", data);

            if (this.fieldsMap == undefined) {
                this.fieldsMap = [];
                for (let x = 0; x < data.columns; x++) {
                    this.fieldsMap[x] = [];
                    // for (let y = 0; y < data.rows; y++) {
                    //     this.fieldsMap[x][y] = null;
                    // }
                }
            }

            let tmp: any = {};
            if (data.observedMapFields) {
                tmp.observedMapFields = data.observedMapFields.map((mapFieldData: any) => {
                    let mapField = instantiateMapField(mapFieldData);
                    this.fieldsMap[mapField.column][mapField.row];
                    return mapField;
                });
            }

            data.opponents.forEach((opponent) => {
                // if (opponent.buildings.length > 0)
                //     buildingsList.push(...opponent.buildings);
                opponent.buildings = opponent.buildings.map((building) => {
                    let instantiatedBuilding = instantiateBuilding(building);
                    this.allBuildings.push(instantiatedBuilding);
                    return instantiatedBuilding;
                });
            });

            if (data.buildings)
                tmp.buildings = data.buildings.map((buildingData: Building) => {
                    let building = instantiateBuilding(buildingData);
                    this.allBuildings.push(building);
                    return building;
                });

            if (data.opponents)
                tmp.opponents = data.opponents.map((opponent: Opponent) => {
                    return instantiateOpponent(opponent, this.allBuildings);
                });

            if (tmp.observedMapFields)
                tmp.observedMapFields.forEach((mapField: MapField) => {
                    fillMapField(mapField, this.allBuildings);
                });

            if (tmp.buildings)
                tmp.buildings.forEach((building: Building) => {
                    fillBuilding(building, this.fieldsMap);
                });

            Object.assign(data, tmp);
            Object.assign(this.player, Object.fromEntries(Object.entries(data).filter(
                ([key, value]) => {
                    return (value == true || value == false) ? true : value;
                    // if value is boolean, leave it in object, otherwise throw it out
                    //if it is falsy (null, undefined etc)
                })));

            this.graphics3dManager.renderMap();
        });

        this.socket.on("opponentJoined", (opponent: Opponent) => {
            console.log("dostałem info, że dołączył użytkownik o id: ", opponent.userId);
            this.player.opponents.push(instantiateOpponent(opponent, this.allBuildings));
        });

        this.socket.on("buildingPlaced", (placedBuilding) => {
            let building = instantiateBuilding(placedBuilding);
            fillBuilding(building, this.fieldsMap);
            this.allBuildings.push(building);
            let mesh = this.meshes3dCreator.getDistinguishedTypeBuildingMesh(building);
            mesh.position.set(
                mesh.buildingData.x,
                mesh.buildingData.y,
                0
            );
            this.graphics3dManager.scene.add(mesh);
            this.buildingPlaceIndicator.clear();
        });

        this.socket.on("mapFields", (data) => {
            console.log("odebrano wydarzenie mapFields: ", data);
            let tmp: any = {};
            if (data.observedMapFields)
                tmp.observedMapFields = data.observedMapFields.map((mapFieldData: any) => {
                    if (this.fieldsMap[mapFieldData.column][mapFieldData.row] == undefined) {
                        let observedMapField = instantiateMapField(mapFieldData);
                        observedMapField.buildings.forEach((newBuilding) => {
                            this.createOpponentsBuildingIfDoesNotExist(newBuilding);
                        });
                        fillMapField(observedMapField, this.allBuildings);
                        this.fieldsMap[observedMapField.column][observedMapField.row] = observedMapField;
                        return observedMapField;
                    } else {
                        mapFieldData.buildings.forEach((newBuilding: Building) => {
                            this.createOpponentsBuildingIfDoesNotExist(newBuilding);
                        });
                        fillMapField(mapFieldData, this.allBuildings);
                        return Object.assign(
                            this.fieldsMap[mapFieldData.column][mapFieldData.row],
                            mapFieldData
                        );
                    }

                });
            if (data.visitedMapFields)
                tmp.visitedMapFields = data.visitedMapFields.map((mapFieldData: any) => {
                    if (this.fieldsMap[mapFieldData.column][mapFieldData.row] == undefined) {
                        let visitedMapField = instantiateMapField(mapFieldData);
                        fillMapField(visitedMapField, this.allBuildings);
                        this.fieldsMap[visitedMapField.column][visitedMapField.row] = visitedMapField;
                        return visitedMapField;
                    } else {
                        fillMapField(mapFieldData, this.allBuildings);
                        return Object.assign(
                            this.fieldsMap[mapFieldData.column][mapFieldData.row],
                            mapFieldData
                        );
                    }
                });

            Object.assign(data, tmp);
            Object.assign(this.player, Object.fromEntries(Object.entries(data).filter(
                ([key, value]) => {
                    return (value == true || value == false) ? true : value;
                    // if value is boolean, leave it in object, otherwise
                    // throw it out if it is falsy (null, undefined etc)
                })));
            this.graphics3dManager.discoverFields(data);
        });

        this.socket.on("opponentBuilding", (data) => {
            console.log("dostałem info, że przeciwnik postawił budynek.");

            let opponent = this.player.getOpponentById(data.opponentId);
            console.log("data: ", data);
            console.log("opponent: ", opponent);

            let storedChangedBuildings: Building[] = [];
            for (let i = 0; i < data.changedBuildings.length; i++) {
                let changedBuilding = data.changedBuildings[i];
                let building = opponent.buildings.find((building) => { return building.id == changedBuilding.id; });
                if (building) {
                    Object.assign(building, changedBuilding);
                } else {
                    building = instantiateBuilding(changedBuilding);
                    fillBuilding(building, this.fieldsMap);
                    this.allBuildings.push(building);
                    opponent.buildings.push(building);
                }
                storedChangedBuildings.push(building);
            }
            this.graphics3dManager.discoverOpponentsBuildings(storedChangedBuildings);
        });
    };

    placeBuilding = (building: Building) => {
        this.socket.emit("building", building);
    };

    /**
     * Creates building, if it has not been already created. By creation is meant:
     * instantialization, addition to {@link allBuildings} array and creation of 
     * 3d object.
     * @param building Processed building data.
     * @returns Created {@link Building} or null, if already existed.
     */
    createOpponentsBuildingIfDoesNotExist = (building: Building): Building | null => {
        if (this.allBuildings.find((checkedBuilding) => { return checkedBuilding.id == building.id; }))
            return null;
        let instantiatedBuilding = instantiateBuilding(building);
        this.allBuildings.push(instantiatedBuilding);
        this.graphics3dManager.discoverOpponentsBuildings([building]);
    };
}