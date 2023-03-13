import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import { Service } from "typedi";
import Building from "./dataClasses/Building";
import BuildingsTypes from "./dataClasses/buildings/BuildingsTypes";
import MainBuilding from "./dataClasses/buildings/MainBuilding";
import MapField from "./dataClasses/MapField";
import FieldsTypes from "./dataClasses/mapFields/FieldsTypes";
import Grassland from "./dataClasses/mapFields/Grassland";
import Graphics3dManager from "./Graphics3dManager";
import envSettings from '../../settings.json';


/**
 * Provides methods for socket communication with server.
 */
@Service()
export default class SocketManager {
    private readonly socket: Socket;

    constructor(
        private readonly graphics3dManager: Graphics3dManager
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

    private setEventListeners = () => {
        this.socket.on("connect", () => {
            console.log("uzyskano połączenie z serwerem.");
            this.socket.emit("test", { random: "data" });
            this.socket.emit("map");
        });

        this.socket.on("map", (data) => {
            console.log("odebrano wydarzenie map: ", data);
            data.observedMapFields = data.observedMapFields.map((mapFieldData: any) => {
                return this.instantiateMapField(mapFieldData);
            });

            data.buildings = data.buildings.map((building: Building) => {
                return this.instantiateBuilding(building);
            })

            this.graphics3dManager.renderMap(data);
        });
    };

    private instantiateMapField(mapFieldData: MapField): MapField {
        switch (mapFieldData.type) {
            case FieldsTypes.GRASSLAND:
                return Object.assign(new Grassland(-1, -1), mapFieldData);
                break;
            default: throw new Error("Such MapField type as " + mapFieldData.type + " does not exist.");
        }
    }

    private instantiateBuilding(building: Building): Building {
        switch (building.type) {
            case BuildingsTypes.MAIN:
                return Object.assign(new MainBuilding(-1, -1), building);
                break;
            // Rest of types of Building to write here
            /*
            case BuildingsTypes.MINE:
                return Object.assign(new Mine(-1, -1), building);
                break;
            */
            default: throw new Error("Such Building type as " + building.type + " does not exist.");
        }
    }
}