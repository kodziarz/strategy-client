import 'reflect-metadata';
import Container, { Inject, Service } from "typedi";
import Graphics3dManager from "./Graphics3dManager";
import SocketManager from './SocketManager';
import UIManager from './UIManager';
import Cookies from 'js-cookie';
import UIInterface from './UIInterface';
import Player from '../../../strategy-common/dataClasses/Player';

/**
 * 
 */
@Service()
class Main {

    // private graphics3dManager: Graphics3dManager;

    @Inject(type => UIManager)
    private uiManager: UIManager;

    @Inject(type => Graphics3dManager)
    private graphics3dManager: Graphics3dManager;

    @Inject(type => SocketManager)
    private socketManager: SocketManager;

    constructor() {
        console.log('token gracza:', Cookies.get('token'));

    }
}
Container.set(Player, new Player(-1, -1, -1));
Container.get(Main); // to wbrew pozorom coś robi