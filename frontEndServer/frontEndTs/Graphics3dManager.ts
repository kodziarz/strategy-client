import * as THREE from "three";
import { Service } from "typedi";
import SETTINGS from "./SETTINGS.json";

/**
 * Manages displaying 3d map.
 */
@Service()
export default class Graphics3dManager {

    private rootDiv: HTMLDivElement;
    private scene = new THREE.Scene();
    private camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    private renderer = new THREE.WebGLRenderer();
    private cube: THREE.Mesh = null;
    private gameMechanicsInterval: NodeJS.Timer;
    private beginningTime: number;

    constructor() {
        console.log("konstruktor managera się odpalił");

        this.rootDiv = document.getElementById("root3d") as HTMLDivElement;

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.rootDiv.appendChild(this.renderer.domElement);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        this.camera.position.z = 5;
        this.render();

        const deltaTime = SETTINGS.GAME_MECHANICS_INTERVAL / 1000;
        this.beginningTime = Date.now();
        this.gameMechanicsInterval = setInterval(
            () => {
                this.initGameMechanics(deltaTime, Date.now() - this.beginningTime);
            },
            SETTINGS.GAME_MECHANICS_INTERVAL
        );
    }

    /**
     * Provides rendering of the scene.
     * @remarks This method should not be used to move objects, because the frequency
     * of its invocation may depend on the hardware enviroment.
     * @see {@link initGameMechanics}
     */
    render = () => {
        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
    };

    /**
     * Powers game mechanics by regular invocation of given methods.
     * @remarks Invocaton interval can changed in SETTINGS.json
     * as GAME_MECHANICS_INTERVAL.
     * @param deltaTime Time intervened since last invocation.
     * @param intervenedTime Time intervened since game start.
     */
    initGameMechanics = (deltaTime: number, intervenedTime: number) => {

        this.moveCube(deltaTime, intervenedTime);
    };

    /**
     * @example
     */
    moveCube = (deltaTime: number, intervenedTime: number) => {
        this.cube.rotation.x += 0.6 * deltaTime;
        this.cube.position.x = Math.sin(intervenedTime / 1000) * 5;
    };


}