import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import Container, { Service } from "typedi";
import Building from "./../../../strategy-common/dataClasses/Building";
import Graphics3dManager from "./Graphics3dManager";
import envSettings from '../../settings.json';
import BuildingPlaceIndicator from "./graphics3dManager/BuildingPlaceIndicator";
import Meshes3dCreator from "./graphics3dManager/Meshes3dCreator";
import { instantiateBuilding, instantiateMapField, instantiateOpponent } from "./../../../strategy-common/classInstantiatingService";
import Player from "./../../../strategy-common/dataClasses/Player";
import Opponent from "../../../strategy-common/dataClasses/Opponent";

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
            this.socket.emit("test", { random: "data" });
            this.socket.emit("map");
        });

        this.socket.on("map", (data: Player) => {
            console.log("odebrano wydarzenie map: ", data);
            let tmp: any = {};
            if (data.observedMapFields)
                tmp.observedMapFields = data.observedMapFields.map((mapFieldData: any) => {
                    return instantiateMapField(mapFieldData);
                });

            if (data.buildings)
                tmp.buildings = data.buildings.map((building: Building) => {
                    return instantiateBuilding(building);
                });

            if (data.opponents)
                tmp.opponents = data.opponents.map((opponent: Opponent) => {
                    return instantiateOpponent(opponent);
                });

            Object.assign(data, tmp);
            Object.assign(this.player, Object.fromEntries(Object.entries(data).filter(
                ([key, value]) => {
                    return (value == true || value == false) ? true : value;
                    // if value is boolean, leace it in object, otherwise throw it out
                    //if it is falsy (null, undefined etc)
                })));

            this.graphics3dManager.renderMap();
        });

        this.socket.on("opponentJoined", (opponent: Opponent) => {
            console.log("dostałem info, że dołączył użytkownik o id: ", opponent.userId);
            this.player.opponents.push(instantiateOpponent(opponent));
        });

        this.socket.on("buildingPlaced", (placedBuilding) => {
            let building = instantiateBuilding(placedBuilding);
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
                    return instantiateMapField(mapFieldData);
                });
            if (data.visitedMapFields)
                tmp.visitedMapFields = data.visitedMapFields.map((mapFieldData: any) => {
                    return instantiateMapField(mapFieldData);
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
}