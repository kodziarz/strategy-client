import * as THREE from "three";
import Container, { Service } from "typedi";
import SETTINGS from "./SETTINGS";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import MapField from "./../../../strategy-common//dataClasses/MapField";
import GrasslandMesh from "./meshes/GrasslandMesh";
import { Vector3 } from "three";
import Building from "./../../../strategy-common/dataClasses/Building";
import BuildingPlaceIndicator from "./graphics3dManager/BuildingPlaceIndicator";
import Meshes3dCreator from "./graphics3dManager/Meshes3dCreator";
import Player from "../../../strategy-common/dataClasses/Player";
import Grassland from "../../../strategy-common/dataClasses/mapFields/Grassland";
import MapFieldMesh from "./meshes/MapFieldMesh";
import BuildingMesh from "./meshes/BuildingMesh";
import MainBuildingMesh from "./meshes/buildingMeshes/MainBuildingMesh";
import MainBuilding from "../../../strategy-common/dataClasses/buildings/MainBuilding";
import { instantiateBuilding } from "../../../strategy-common/classInstantiatingService";
/**
 * Manages displaying 3d map.
 */
@Service()
export default class Graphics3dManager {

    addRootDivEventListener: any;
    removeRootDivEventListener: any;
    surface: THREE.Mesh;

    private rootDiv: HTMLDivElement;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    private renderer = new THREE.WebGLRenderer();

    private cube: THREE.Mesh = null;
    private fieldsMeshes: MapFieldMesh[][];
    buildingMeshes: BuildingMesh[] = [];

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

    private player: Player;

    constructor(
        private meshes3dCreator: Meshes3dCreator,
        private buildingPlaceIndicator: BuildingPlaceIndicator,
    ) {
        this.player = Container.get(Player);
        buildingPlaceIndicator.setGraphics3dManager(this);

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
        this.orbitControls.minDistance = this.camera.near * 0.95;
        this.orbitControls.maxDistance = this.camera.far * 0.95;
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

    setRootDiv = (domElement: HTMLDivElement) => {
        this.rootDiv = domElement;
        this.rootDiv.appendChild(this.renderer.domElement);
        this.resizeRenderer();
        this.addRootDivEventListener = (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => (this.rootDiv.addEventListener(type, listener, options));
        this.removeRootDivEventListener = (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void => (this.rootDiv.removeEventListener(type, listener, options));
        window.addEventListener('resize', this.resizeRenderer);
    };


    /**Adjusts camera and renderer to new {@link rootDiv} dimensions. */
    resizeRenderer = () => {
        this.camera.aspect = this.rootDiv.clientWidth / this.rootDiv.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.rootDiv.clientWidth, this.rootDiv.clientHeight);
    };

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
    * Creates {@link MapFieldMesh | map field meshes} and sets camera position.
    * @param data Map data from server.
    */
    private initiateFieldMeshes = () => {
        // initiation of this.fieldsMeshes
        this.fieldsMeshes = [];
        for (let x = 0; x < this.player.columns; x++) {
            this.fieldsMeshes[x] = [];
        }

        this.camera.position.set(
            this.player.buildings[0].x,
            this.player.buildings[0].y,
            10
        );
        this.orbitControls.target = new Vector3(
            this.player.buildings[0].x,
            this.player.buildings[0].y,
            1
        );
    };

    /**
     * Renders map objects: {@link MapFieldMesh | map fields}, {@link Building | buildings} and {@link}.
     * @param data Map data from server.
     */
    renderMap = () => {

        if (!this.fieldsMeshes) this.initiateFieldMeshes();

        // Renders ObservedMapFields
        for (let x = 0; x < this.player.columns; x++) {
            for (let y = 0; y < this.player.rows; y++) {
                let fieldMesh;
                let mapField = this.player.observedMapFields.find((checkedMapField) => {
                    return checkedMapField.column == x && checkedMapField.row == y;
                });
                if (mapField) {
                    //if map field is observed
                    fieldMesh = new GrasslandMesh(mapField);
                    // this.fieldsMeshes[x][y].setObserved();
                } else if (mapField = this.player.visitedMapFields.find((checkedMapField) => {
                    return checkedMapField.column == x && checkedMapField.row == y;
                })) {
                    //if map field is visited
                    fieldMesh = new GrasslandMesh(mapField);
                    fieldMesh.setVisited();
                } else {
                    //map field is neither observed nor visited
                    mapField = new Grassland(x, y);
                    fieldMesh = new GrasslandMesh(mapField);
                    fieldMesh.setInvisible();
                }
                this.fieldsMeshes[x][y] = fieldMesh;
                this.scene.add(fieldMesh);
                fieldMesh.position.set(mapField.centerX, mapField.centerY, 0);
            }
        }

        // Renders Buildings
        if (this.player.buildings)
            for (let i = 0; i < this.player.buildings.length; i++) {
                let building: Building = this.player.buildings[i];
                this.createBuilding(building);
            }

        //renders opponents
        if (this.player.opponents)
            this.player.opponents.forEach((opponent) => { this.discoverOpponentsBuildings(opponent.buildings); });

        /*
        // Renders VisitedMapFields
        for (let i = 0; i < data.visitedMapFields.length; i++) {
            let visitedMapField: any = data.visitedMapFields[i];
        }
        */

        // plane to get indicated point on a map
        if (!this.surface) {
            const geo = new THREE.PlaneGeometry(this.player.columns * SETTINGS.mapFieldSide, this.player.rows * SETTINGS.mapFieldSide);
            const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            this.surface = new THREE.Mesh(geo, material);
            this.surface.position.x = (this.player.columns / 2) * SETTINGS.mapFieldSide;
            this.surface.position.y = (this.player.rows / 2) * SETTINGS.mapFieldSide;
            this.surface.position.z = -1;
            this.scene.add(this.surface);
        }
    };

    createBuilding = (buildingData: Building) => {
        let buildingMesh = this.meshes3dCreator.getDistinguishedTypeBuildingMesh(buildingData);
        this.scene.add(buildingMesh);
        buildingMesh.position.set(buildingData.x, buildingData.y, 0);
    };

    discoverFields = (data: any) => {

        if (data.observedMapFields) {
            data.observedMapFields.forEach((mapField: MapField) => {
                this.fieldsMeshes[mapField.column][mapField.row].setObserved();
            });
        }
        if (data.visitedMapFields) {
            data.visitedMapFields.forEach((mapField: MapField) => {
                this.fieldsMeshes[mapField.column][mapField.row].setObserved();
            });
        }
    };
    /**
     * Displays changed {@link Opponent}'s {@link Building}.
     * @param changedBuildings {@link Building}s from {@link Player}.{@link Opponent}
     * Needs to be already instantiated.
     */
    discoverOpponentsBuildings = (changedBuildings: Building[]) => {
        changedBuildings.forEach((changedBuilding) => {
            let buildingMesh = this.buildingMeshes.find((buildingMesh) => { return buildingMesh.buildingData.id == changedBuilding.id; });
            if (!buildingMesh) {
                buildingMesh = this.meshes3dCreator.getDistinguishedTypeBuildingMesh(changedBuilding);
                this.buildingMeshes.push(buildingMesh);
                this.scene.add(buildingMesh);
            }
            buildingMesh.setOpponentsOwnership();
            buildingMesh.position.set(
                changedBuilding.x,
                changedBuilding.y,
                0
            );
        });
    };
}