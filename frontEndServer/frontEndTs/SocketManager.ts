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
import MapChangedMessage from "./../../../strategy-common/socketMessagesClasses/mapChangesMessage";

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
            console.log("odebrano wydarzenie map: ", data);

            this.dataBinder.bindMapEventData(data);

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

        this.socket.on("buildingPlaced", (placedBuilding) => {
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

        this.socket.on("mapChanges", (data: MapChangedMessage) => {
            console.log("odebrano wydarzenie mapChanges: ", data);

            this.dataBinder.bindMapChangesEvent(data);

            if (data.changedFields)
                this.player.observedMapFields.push(...data.changedFields);

            if (data.changedBuildings)
                data.changedBuildings.forEach((changedBuilding) => {
                    if (changedBuilding.ownerId == this.player.userId) {
                        if (!this.player.buildings.find((checkedBuilding) => { return checkedBuilding.id == changedBuilding.id; })) {
                            //if player has not got the building yet
                            this.player.buildings.push(changedBuilding);
                            this.graphics3dManager.createBuilding(changedBuilding);
                        }
                    } else { //building is owned by opponent
                        let opponent = this.player.getOpponentById(changedBuilding.ownerId);
                        if (!opponent.buildings.find((checkedBuilding) => { return checkedBuilding.id == changedBuilding.id; })) {
                            // if opponent has not got the building yet
                            opponent.buildings.push(changedBuilding);
                            this.graphics3dManager.createBuilding(changedBuilding);
                        }
                    }
                });

            if (data.changedFields)
                this.graphics3dManager.discoverFields(data.changedFields);
        });
    };

    placeBuilding = (building: Building) => {
        this.socket.emit("building", building);
    };
}