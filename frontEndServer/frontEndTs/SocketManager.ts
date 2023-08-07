import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import Container, { Service } from "typedi";
import Building from "./../../../strategy-common/dataClasses/Building";
import Graphics3dManager from "./Graphics3dManager";
import envSettings from '../../settings.json';
import BuildingPlaceIndicator from "./graphics3dManager/BuildingPlaceIndicator";
import Meshes3dCreator from "./graphics3dManager/Meshes3dCreator";
import { instantiateOpponent, instantiateBuilding, instantiateMapField, fillMapField } from "./../../../strategy-common/classInstantiatingService";
import Player from "./../../../strategy-common/dataClasses/Player";
import Opponent from "../../../strategy-common/dataClasses/Opponent";
import DataBinder from "./socketManager/DataBinder";
import MapChangesMessage from "./../../../strategy-common/socketioMessagesClasses/MapChangesMessage";
import BuildingWithIdentifiers from "../../../strategy-common/socketioMessagesClasses/BuildingWithIdentifiers";
import Unit from "../../../strategy-common/dataClasses/Unit";

/**
 * Provides methods for socket communication with server.
 */
@Service()
export default class SocketManager {
    private readonly socket: Socket;
    private player: Player;

    constructor(
        private readonly graphics3dManager: Graphics3dManager,
        private readonly buildingPlaceIndicator: BuildingPlaceIndicator,
        private readonly meshes3dCreator: Meshes3dCreator,
        private readonly dataBinder: DataBinder
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
            this.socket.emit("init");
        });

        this.socket.on("init", (data: Player) => {
            console.log("odebrano wydarzenie init: ", data);

            this.dataBinder.bindInitEventData(data);

            //player is already instantiated in main.ts
            Object.assign(this.player, Object.fromEntries(Object.entries(data).filter(
                ([key, value]) => {
                    return value != null && value != undefined;
                    // filter out unefined and null values
                })));
            this.graphics3dManager.renderMap();
        });

        this.socket.on("opponentJoined", (opponent: Opponent) => {
            console.log("dostałem info, że dołączył użytkownik o id: ", opponent.userId);
            let actualOpponent = this.dataBinder.receiveOpponentData(opponent);
            this.player.opponents.push(actualOpponent);
        });

        this.socket.on("buildingPlaced", (placedBuilding: BuildingWithIdentifiers) => {
            let building = this.dataBinder.receivePlacedBuilding(placedBuilding);
            let mesh = this.meshes3dCreator.getDistinguishedTypeBuildingMesh(building);
            mesh.position.set(
                mesh.buildingData.x,
                mesh.buildingData.y,
                0
            );
            this.graphics3dManager.scene.add(mesh);
            this.buildingPlaceIndicator.clear();
        });

        this.socket.on("unitCreated", (createdUnit: Unit) => {
            console.log("otrzymałem potwierdzenie utworzenia jednostki: ", createdUnit);
        });

        this.socket.on("mapChanges", (data: MapChangesMessage) => {
            console.log("odebrano wydarzenie mapChanges: ", data);

            let boundData = this.dataBinder.bindMapChangesEvent(data);

            if (boundData.changedFields) {
                boundData.changedFields.forEach((changedField) => {
                    if (!this.player.observedMapFields.find((observedMapField) => { return observedMapField == changedField; })) {
                        //field is new for player
                        this.player.observedMapFields.push(changedField);
                    }
                });
                //only new fields are added, because dataBinder already updated known.
            }

            if (boundData.changedBuildings)
                boundData.changedBuildings.forEach((changedBuilding) => {
                    if (changedBuilding.ownerId == this.player.userId) {
                        //building belongs to player
                        let currentBuilding = this.player.buildings.find((checkedBuilding) => { return checkedBuilding.id == changedBuilding.id; });
                        if (!currentBuilding) {
                            //if player has not got the building yet
                            this.player.buildings.push(changedBuilding);
                            this.graphics3dManager.createBuilding(changedBuilding);
                        } else {
                            Object.assign(currentBuilding, changedBuilding);
                            this.graphics3dManager.updateBuilding(currentBuilding);
                        }
                    } else { //building is owned by opponent
                        let opponent = this.player.getOpponentById(changedBuilding.ownerId);
                        let currentBuilding = opponent.buildings.find((checkedBuilding) => { return checkedBuilding.id == changedBuilding.id; });
                        if (!currentBuilding) {
                            // if opponent has not got the building yet
                            opponent.buildings.push(changedBuilding);
                            this.graphics3dManager.createBuilding(changedBuilding);
                        } else {
                            Object.assign(currentBuilding, changedBuilding);
                            this.graphics3dManager.updateBuilding(currentBuilding);
                        }
                    }
                });

            if (boundData.changedFields)
                this.graphics3dManager.discoverFields(boundData.changedFields);
        });
    };

    /**
     * Sends request to server to place building.
     * @param building Data of building to place (there cannot be any occupiedFields).
     * The actual id of building will be replaced by sever and returned in
     * "buildingPlaced" event.
     */
    placeBuilding = (building: BuildingWithIdentifiers) => {
        if (building.occupiedFields.length > 0)
            throw new Error("Passed building argument has some occupiedFields. At this stage there cannot be any occupiedFields because of recursion errors.");
        this.socket.emit("building", building);
    };

    createUnit = (unit: Unit) => {
        this.socket.emit("unit", unit);
    };
}