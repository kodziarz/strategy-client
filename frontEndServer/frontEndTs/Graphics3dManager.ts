import * as THREE from "three";
import { Service } from "typedi";
import SETTINGS from "./SETTINGS";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import MapField from "./dataClasses/MapField";
import GrasslandMesh from "./meshes/GrasslandMesh";
import { Vector3 } from "three";
import Building from "./dataClasses/Building";
import BuildingMesh from "./meshes/BuildingMesh";
import BuildingsTypes from "./dataClasses/buildings/BuildingsTypes";
import MainBuilding from "./dataClasses/buildings/MainBuilding";
import MainBuildingMesh from "./meshes/MainBuildingMesh";
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
    private fieldsMeshes: THREE.Mesh[][];

    private gameMechanicsInterval: NodeJS.Timer;
    private beginningTime: number;
    private orbitControls: OrbitControls;

    /**
     * If negative, camera moves to the left, if positive, moves to the right,
     * otherwise does not move.
     * Varies between -1 and 1.
     */
    cameraXVelocity = 0;

    /**
     * if negative, camera moves up, if positive, moves down, otherwise
     * does not move.
     * Varies between -1 and 1.
     */
    cameraYVelocity = 0;

    constructor() {
        this.rootDiv = document.getElementById("root3d") as HTMLDivElement;

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.rootDiv.appendChild(this.renderer.domElement);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);
        let axes = new THREE.AxesHelper(500);
        this.scene.add(axes);

        this.camera.up.set(0, 0, 1);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableZoom = true;
        this.orbitControls.enablePan = false;
        this.orbitControls.maxPolarAngle = Math.PI / 2;
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
        this.orbitControls.update();
    };

    resizeRenderer = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    /**
     * Powers game mechanics by regular invocation of given methods.
     * @remarks Invocaton interval can changed in SETTINGS.json
     * as GAME_MECHANICS_INTERVAL.
     * @param deltaTime Time intervened since last invocation.
     * @param intervenedTime Time intervened since game start.
     */
    initGameMechanics = (deltaTime: number, intervenedTime: number) => {

        // this.moveCube(deltaTime, intervenedTime);
        this.moveCamera(deltaTime);
    };

    /**
     * @example
     */
    moveCube = (deltaTime: number, intervenedTime: number) => {
        this.cube.rotation.x += 0.6 * deltaTime;
        this.cube.position.x = Math.sin(intervenedTime / 1000) * 5;
    };

    /**
     * Moves the camera according to {@link cameraXVelocity} and
     * {@link cameraYVelocity}.
     * @param deltaTime Time intervened since last invocation.
     */
    private moveCamera = (deltaTime: number) => {
        let target = new Vector3(0, 0, 0);// useless vector needed by getWorldDirection

        if (this.cameraXVelocity != 0) {
            const cameraAngle = this.camera.rotation.z;
            const deltaPosition =
                SETTINGS.cameraVelocityToZPositionCoeffictient
                * this.camera.position.z
                * this.cameraXVelocity
                * deltaTime;

            const vector = new Vector3(
                deltaPosition * Math.cos(cameraAngle),
                deltaPosition * Math.sin(cameraAngle),
                0
            );
            this.camera.position.add(vector);
            this.orbitControls.target.add(vector);
        }
        if (this.cameraYVelocity != 0) {
            const cameraAngle = this.camera.rotation.z;
            const deltaPosition =
                SETTINGS.cameraVelocityToZPositionCoeffictient
                * this.camera.position.z
                * this.cameraYVelocity
                * deltaTime;

            const vector = new Vector3(
                -deltaPosition * Math.sin(cameraAngle),
                deltaPosition * Math.cos(cameraAngle),
                0
            );
            this.camera.position.add(vector);
            this.orbitControls.target.add(vector);
        }

    };


    /**
    * Creates {@link MapFieldMesh | map fields} and sets camera position.
    * @param data Map data from server.
    */
    private initiateFieldMeshes = (data: any) => {
        // initiation of this.fieldsMeshes
        this.fieldsMeshes = [];
        for (let x = 0; x < data.columns; x++) {
            this.fieldsMeshes[x] = [];
        }

        this.camera.position.set(
            data.buildings[0].x,
            data.buildings[0].y,
            10
        );
        this.orbitControls.target = new Vector3(data.buildings[0].x, data.buildings[0].y, 1);
    }

    /**
     * Creates BuildingMesh of served Building type.
     * @param building type of {@link Building}
     * @returns new {@link BuildingMesh} 
     */
    private getDistinguishedTypeBuildingMesh = (building: Building) => {
        switch (building.type) {
            case BuildingsTypes.MAIN:
                return new MainBuildingMesh(building);
            default: throw new Error("Such MapField type as " + building.type + " does not exist.");
        }
    }

    /**
     * Renders map objects: {@link MapFieldMesh | map fields}, {@link Building | buildings} and {@link}.
     * @param data Map data from server.
     */
    renderMap = (data: any) => {

        if (!this.fieldsMeshes) this.initiateFieldMeshes(data);

        // Renders ObservedMapFields
        for (let i = 0; i < data.observedMapFields.length; i++) {
            let field: MapField = data.observedMapFields[i];
            let mapFieldMesh = new GrasslandMesh(field);
            this.fieldsMeshes[field.column][field.row] = mapFieldMesh;
            this.scene.add(mapFieldMesh);

            // mapFieldMesh.position.x = field.x;
            // mapFieldMesh.position.y = field.y;
            mapFieldMesh.position.set(field.x, field.y, 0);
        }

        // Renders Buildings
        for (let i = 0; i < data.buildings.length; i++) {
            let building: Building = data.buildings[i];
            let buildingMesh = this.getDistinguishedTypeBuildingMesh(building);
            this.scene.add(buildingMesh);
            buildingMesh.position.set(building.x, building.y, 0);
        }

        /*
        // Renders VisitedMapFields
        for (let i = 0; i < data.visitedMapFields.length; i++) {
            let visitedMapField: any = data.visitedMapFields[i];
        }
        */
    };

}