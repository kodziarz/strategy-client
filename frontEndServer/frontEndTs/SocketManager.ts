import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import { Service } from "typedi";
import Building from "./../../../strategy-common/dataClasses/Building";
import Graphics3dManager from "./Graphics3dManager";
import envSettings from '../../settings.json';
import BuildingPlaceIndicator from "./graphics3dManager/BuildingPlaceIndicator";
import Meshes3dCreator from "./graphics3dManager/Meshes3dCreator";
import { instantiateBuilding, instantiateMapField } from "./../../../strategy-common/classInstantiatingService";


/**
 * Provides methods for socket communication with server.
 */
@Service()
export default class SocketManager {
    private readonly socket: Socket;

    constructor(
        private readonly graphics3dManager: Graphics3dManager,
        private readonly buildingPlaceIndicator: BuildingPlaceIndicator,
        private readonly meshes3dCreator: Meshes3dCreator
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

        this.socket.on("map", (data) => {
            console.log("odebrano wydarzenie map: ", data);
            if (data.observedMapFields)
                data.observedMapFields = data.observedMapFields.map((mapFieldData: any) => {
                    return instantiateMapField(mapFieldData);
                });

            if (data.buildings)
                data.buildings = data.buildings.map((building: Building) => {
                    return instantiateBuilding(building);
                });

            this.graphics3dManager.renderMap(data);
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