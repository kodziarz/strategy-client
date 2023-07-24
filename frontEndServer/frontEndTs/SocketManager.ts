import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import Container, { Service } from "typedi";
import Building from "./../../../strategy-common/dataClasses/Building";
import Graphics3dManager from "./Graphics3dManager";
import envSettings from '../../settings.json';
import BuildingPlaceIndicator from "./graphics3dManager/BuildingPlaceIndicator";
import Meshes3dCreator from "./graphics3dManager/Meshes3dCreator";
import { instantiateBuilding, instantiateMapField } from "./../../../strategy-common/classInstantiatingService";
import Player from "./../../../strategy-common/dataClasses/Player";

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

            Object.assign(data, tmp);
            Object.assign(this.player, Object.fromEntries(Object.entries(data).filter(
                ([key, value]) => {
                    return (value == true || value == false) ? true : value;
                    // if value is boolean, leace it in object, otherwise throw it out
                    //if it is falsy (null, undefined etc)
                })));

            this.graphics3dManager.renderMap();
        });

        this.socket.on("buildingPlaced", (data) => {
            let building = instantiateBuilding(data.placedBuilding);
            let mesh = this.meshes3dCreator.getDistinguishedTypeBuildingMesh(building);
            mesh.position.set(
                mesh.buildingData.x,
                mesh.buildingData.y,
                0
            );
            this.graphics3dManager.scene.add(mesh);
            this.buildingPlaceIndicator.clear();
        });
    };

    placeBuilding = (building: Building) => {
        this.socket.emit("building", building);
    };
}