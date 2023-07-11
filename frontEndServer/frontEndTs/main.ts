import 'reflect-metadata';
import Container, { Service } from "typedi";
import Graphics3dManager from "./Graphics3dManager";
import SocketManager from './SocketManager';
import UIManager from './UIManager';
import Cookies from 'js-cookie';
import UIInterface from './UIInterface';

/**
 * 
 */
@Service()
class Main {

    // private graphics3dManager: Graphics3dManager;

    constructor(
        private uiManager: UIManager,
        private graphics3dManager: Graphics3dManager,
        private socketManager: SocketManager,
    ) {
        console.log('token gracza:', Cookies.get('token'));

    }
}

Container.set(UIInterface, new UIInterface());
Container.get(Main); // to wbrew pozorom coś robi