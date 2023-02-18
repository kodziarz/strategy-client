import 'reflect-metadata';
import Container, { Service } from "typedi";
import Graphics3dManager from "./Graphics3dManager";
import SocketManager from './SocketManager';
import UIManager from './UIManager';
import Cookies from 'js-cookie';

// let websocket = new WebSocket("ws://localhost:3000");

// websocket.onopen = () => {
//     console.log("Uzyskano połączenie");

// }


/**
 * 
 */
@Service()
class Main {

    // private graphics3dManager: Graphics3dManager;

    constructor(
        private graphics3dManager: Graphics3dManager,
        private uiManager: UIManager,
        private socketManager: SocketManager,
    ) {
        // this.graphics3dManager = new Graphics3dManager(document.getElementById("root3d") as HTMLDivElement);
        console.log('token gracza:', Cookies.get('token'));

    }
}

// let main = new Main();
// let main = Container.get(Main)
Container.get(Main);