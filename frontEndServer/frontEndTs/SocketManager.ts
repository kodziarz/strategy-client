import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import { Service } from "typedi";

/**
 * Provides methods for socket communication with server.
 */
@Service()
export default class SocketManager {
    private socket: Socket;

    constructor() {
        this.socket = io("ws://localhost:3000");
        this.socket.on("connect", () => {
            console.log("uzyskano połączenie z serwerem.");
            this.socket.on("join", (data) => { console.log("Serwer odpowiedział: ", data); })
            // let user: { userId: number } = JSON.parse(Cookies.get("user"));
            // this.socket.emit("join", { id: user.userId, data: "Halo, halo, odbiór." });
            this.socket.emit("join", { data: "Halo, halo, odbiór." });
        })
    }
}