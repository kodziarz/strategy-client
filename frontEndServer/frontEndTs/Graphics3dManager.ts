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
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import Unit from "../../../strategy-common/dataClasses/Unit";
import UnitMesh from "./meshes/UnitMesh";
import ObjectsSelector from "./graphics3dManager/ObjectsSelector";
import UnitMover from "./graphics3dManager/UnitMover";

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

    private fieldsMeshes: MapFieldMesh[][];
    buildingMeshes: BuildingMesh[] = [];
    unitMeshes: UnitMesh[] = [];

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
        private objectsSelector: ObjectsSelector,
        private unitMover: UnitMover
    ) {
        this.player = Container.get(Player);
        objectsSelector.setGraphics3dManager(this);
        buildingPlaceIndicator.setGraphics3dManager(this);
        unitMover.setUnitMeshes(this.unitMeshes);

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
        this.objectsSelector.activate();
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
        let currentTime = Date.now();
        this.moveCamera(deltaTime);
        this.unitMover.moveUnits(currentTime);
    };

    // /**
    //  * @example
    //  */
    // moveCube = (deltaTime: number, intervenedTime: number) => {
    //     this.cube.rotation.x += 0.6 * deltaTime;
    //     this.cube.position.x = Math.sin(intervenedTime / 1000) * 5;
    // };

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
            this.player.buildings.forEach((building) => {
                this.createBuilding(building);
            });

        //renders opponents' building
        if (this.player.opponents)
            this.player.opponents.forEach((opponent) => {
                opponent.buildings.forEach((building) => {
                    this.createBuilding(building);
                });
            });

        //renders units
        if (this.player.units)
            this.player.units.forEach((unit) => {
                this.createUnit(unit);
            });

        //renders opponents' units
        if (this.player.opponents)
            this.player.opponents.forEach((opponent) => {
                opponent.units.forEach((unit) => {
                    this.createUnit(unit);
                });
            });

        /*
        // Renders VisitedMapFields
        for (let i = 0; i < data.visitedMapFields.length; i++) {
            let visitedMapField: any = data.visitedMapFields[i];
        }
        */

        // plane to get indicated point on a map
        if (!this.surface) {
            const geo = new THREE.PlaneGeometry(this.player.columns * SETTINGS.mapFieldSide, this.player.rows * SETTINGS.mapFieldSide);
            // const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
            const material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
            this.surface = new THREE.Mesh(geo, material);
            this.surface.position.x = (this.player.columns / 2) * SETTINGS.mapFieldSide;
            this.surface.position.y = (this.player.rows / 2) * SETTINGS.mapFieldSide;
            this.surface.position.z = 1;
            this.scene.add(this.surface);
        }


        //loading 3d model
        // const loader = new GLTFLoader();

        // //reportedely optional
        // const dracoLoader = new DRACOLoader();
        // dracoLoader.setDecoderPath("/draco/");
        // loader.setDRACOLoader(dracoLoader);


        // loader.load("models/2CylinderEngine.gltf", (gltf) => {
        //     this.scene.add(gltf.scene);
        //     console.log(gltf instanceof THREE.Object3D);

        // });

        // const color = 0x888888;
        // const intensity = 1;
        // const light = new THREE.AmbientLight(color, intensity);
        // this.scene.add(light);

    };

    /**
     * Creates building mesh and adds it to {@link scene}.
     * @param buildingData Building data, which the {@link BuildingMesh} is
     * based on.
     * @returns Created building mesh.
     */
    createBuilding = (buildingData: Building): BuildingMesh => {
        let buildingMesh = this.meshes3dCreator.getDistinguishedTypeBuildingMesh(buildingData);
        this.scene.add(buildingMesh);
        this.buildingMeshes.push(buildingMesh);

        if (buildingData.ownerId != this.player.userId)
            buildingMesh.setOpponentsOwnership();

        return buildingMesh;
    };

    /**
    * Updates building mesh.
    * @param buildingData Building data, which the {@link BuildingMesh} is
    * based on.
    * @returns Updated building mesh.
    */
    updateBuilding = (buildingData: Building): BuildingMesh => {
        let buildingMesh = this.buildingMeshes.find((buildingMesh) => { return buildingMesh.buildingData.id == buildingData.id; });
        buildingMesh.position.set(
            buildingData.x,
            buildingData.y,
            buildingMesh.height / 2
        );

        return buildingMesh;
    };


    /**
     * Creates unit mesh and adds it to {@link scene}.
     * @param unitData Unit data, which the {@link UnitMesh} is
     * based on.
     * @returns Created unit mesh.
     */
    createUnit = (unitData: Unit): UnitMesh => {
        let unitMesh = this.meshes3dCreator.getDistinguishedTypeUnitMesh(unitData);
        this.scene.add(unitMesh);
        this.unitMeshes.push(unitMesh);

        if (unitData.ownerId != this.player.userId)
            unitMesh.setOpponentsOwnership();

        return unitMesh;
    };

    /**
    * Updates unit mesh.
    * @param unitData Unit data, which the {@link UnitMesh} is
    * based on.
    * @returns Updated unit mesh.
    */
    updateUnit = (unitData: Unit): UnitMesh => {
        let unitMesh = this.unitMeshes.find((unitMesh) => { return unitMesh.unitData.id == unitData.id; });
        unitMesh.position.set(
            unitData.x,
            unitData.y,
            unitMesh.height / 2
        );

        return unitMesh;
    };


    // probably redundant
    // /**
    //  * Updates {@link BuildingMesh} according to given data, or creates it, if
    //  * it has not been created yet.
    //  * @param building Building data, which creation or update of
    //  * {@link BuildingMesh} is based on.
    //  * @returns Created building mesh.
    //  */
    // updateOrCreateBuilding = (building: Building): BuildingMesh => {
    //     let buildingMesh = this.buildingMeshes.find((buildingMesh) => { return buildingMesh.buildingData.id == building.id; });
    //     if (!buildingMesh) {
    //         buildingMesh = this.createBuilding(building);
    //     } else {
    //         this.updateBuilding(building);
    //     }
    //     return buildingMesh;
    // };

    /**
     * Shows not displayed {@link MapFieldMesh}es of given {@link MapField}s' data.
     * @param observedMapFields Fields which should be shown to player.
     */
    discoverFields = (observedMapFields: MapField[]) => {

        observedMapFields.forEach((mapField: MapField) => {
            this.fieldsMeshes[mapField.column][mapField.row].setObserved();
        });

    };
}