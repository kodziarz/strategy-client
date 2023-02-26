import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import { Service } from "typedi";
import MapField from "./dataClasses/MapField";
import FieldsTypes from "./dataClasses/mapFields/FieldsTypes";
import Grassland from "./dataClasses/mapFields/Grassland";
import Graphics3dManager from "./Graphics3dManager";

/**
 * Provides methods for socket communication with server.
 */
@Service()
export default class SocketManager {
    private readonly socket: Socket;

    constructor(
        private readonly graphics3dManager: Graphics3dManager
    ) {
        this.socket = io("ws://localhost:3000", {
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

            this.graphics3dManager.createMap(data);
        });
    };

    private instantiateMapField(mapFieldData: MapField): MapField {
        switch (mapFieldData.type) {
            case FieldsTypes.GRASSLAND:
                return Object.assign(new Grassland(-1, -1), mapFieldData);
            default: throw new Error("Such MapField type as" + mapFieldData.type + " does not exist.");
        }
    }
}