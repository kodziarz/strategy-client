import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import { Service } from "typedi";

/**
 * Provides methods for socket communication with server.
 */
@Service()
export default class SocketManager {
    private readonly socket: Socket;

    constructor() {
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
        });
    };
}