import Container, { Inject, Service } from "typedi";
import Building from "../../../../strategy-common/dataClasses/Building";
import Graphics3dManager from "../Graphics3dManager";
import { Raycaster, Vector2 } from "three";
import Meshes3dCreator from "./Meshes3dCreator";
import BuildingMesh from "../meshes/BuildingMesh";

// SWITCH TO THE PLANE INSTEAD OF PLANEGEOMETRY

/**Allows player to indicate place for building. */
@Service()
export default class BuildingPlaceIndicator {

    private graphics3dManager: Graphics3dManager;

    private raycaster: Raycaster = new Raycaster();
    private pointer: Vector2 = new Vector2();

    private resolve: Function = null;
    private currentBuildingMesh: BuildingMesh;
    private reject: Function = null;


    constructor(
        private readonly meshes3dCreator: Meshes3dCreator
    ) { }

    placeBuilding = async (building: Building): Promise<BuildingMesh> => {
        return new Promise((resolve, reject) => {
            if (this.currentBuildingMesh == null) {
                this.resolve = resolve;
                this.reject = reject;
                this.currentBuildingMesh = this.meshes3dCreator.getDistinguishedTypeBuildingMesh(building);
                this.currentBuildingMesh.setTemporaryMode();
                this.graphics3dManager.scene.add(this.currentBuildingMesh);
                this.currentBuildingMesh.position.x = 0;
                this.currentBuildingMesh.position.y = 0;
                console.log("current building mesh: ", this.currentBuildingMesh);

                // console.log("this.graphics3dManager: ", this.graphics3dManager);
                this.graphics3dManager.addRootDivEventListener("mousemove", this.handleMouseMove);
                this.graphics3dManager.addRootDivEventListener("mouseup", this.handleMouseUp);
            } else {
                reject("nie postawiono budynku, który jest obecnie modyfikowany.");
            }
        });
    };

    handleMouseMove = (event: any) => {
        // console.log(event);
        // console.log("x: ", event.offsetX, ", y: ", event.offsetY);

        this.pointer.x = (event.offsetX / event.target.width) * 2 - 1;
        this.pointer.y = - (event.offsetY / event.target.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.graphics3dManager.camera);

        // this.raycaster.ray.intersectPlane()
        const intersects = this.raycaster.intersectObject(this.graphics3dManager.surface, true);
        if (intersects.length > 0) {
            // console.log(intersects[0]);
            const intersectionPoint = intersects[0].point;
            this.currentBuildingMesh.position.x = intersectionPoint.x;
            this.currentBuildingMesh.position.y = intersectionPoint.y;
            this.currentBuildingMesh.buildingData.x = intersectionPoint.x;
            this.currentBuildingMesh.buildingData.y = intersectionPoint.y;
        }

    };

    /**
     * Clears {@link BuildingPlaceIndicator} and prepares it free {@link placeBuilding}.
     */
    clear() {
        this.graphics3dManager.scene.remove(this.currentBuildingMesh);
        this.currentBuildingMesh = null;
    }

    handleMouseUp = () => {
        let resolveFunction = this.resolve;

        this.reject = null;
        this.resolve = null;

        this.graphics3dManager.removeRootDivEventListener("mousemove", this.handleMouseMove);
        this.graphics3dManager.removeRootDivEventListener("mouseup", this.handleMouseUp);

        resolveFunction(this.currentBuildingMesh);
    };

    setGraphics3dManager = (graphics3dManager: Graphics3dManager) => {
        this.graphics3dManager = graphics3dManager;
    };

}