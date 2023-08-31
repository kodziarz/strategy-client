import { Camera, Object3D, Raycaster, Vector2 } from "three";
import Container, { Service } from "typedi";
import Graphics3dManager from "../Graphics3dManager";
import UnitMesh from "../meshes/UnitMesh";
import SocketManager from "../SocketManager";
import Point2d from "../../../../strategy-common/geometryClasses/Point2d";

@Service()
export default class ObjectsSelector {

    private raycaster = new Raycaster();
    private vector: Vector2 = new Vector2();
    private graphics3dManager: Graphics3dManager;
    private socketManager: SocketManager;

    selectedObject: Object3D = null;

    constructor() { }

    activate = () => {
        this.graphics3dManager.addRootDivEventListener("mouseup", this.handleMouseUp);
        this.graphics3dManager.addRootDivEventListener("contextmenu", this.handleContextMenu);
    };

    suspend = () => {
        this.graphics3dManager.removeRootDivEventListener("mouseup", this.handleMouseUp);
        this.graphics3dManager.removeRootDivEventListener("contextmenu", this.handleContextMenu);
        this.selectedObject = null;

    };

    handleMouseUp = (event: any) => {
        this.vector.x = (event.offsetX / event.target.width) * 2 - 1;
        this.vector.y = - (event.offsetY / event.target.height) * 2 + 1;

        this.raycaster.setFromCamera(this.vector, this.graphics3dManager.camera);

        // this.raycaster.ray.intersectPlane()
        const intersects = this.raycaster.intersectObjects(this.graphics3dManager.scene.children);
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object instanceof UnitMesh) {
                console.log("kliknięto jednostkę.");
                this.selectedObject = object;
            }

        }
    };

    handleContextMenu = (event: any) => {
        if (this.selectedObject instanceof UnitMesh) {
            this.vector.x = (event.offsetX / event.target.width) * 2 - 1;
            this.vector.y = - (event.offsetY / event.target.height) * 2 + 1;

            this.raycaster.setFromCamera(this.vector, this.graphics3dManager.camera);
            const intersects = this.raycaster.intersectObject(this.graphics3dManager.surface);

            console.log("Punkt docelowy jednostki: ", intersects[0].point);
            let unit = this.selectedObject.unitData;
            let end = intersects[0].point;
            this.socketManager.moveUnit(
                unit,
                [new Point2d(end.x, end.y)]
            );
        }
    };

    setGraphics3dManager = (graphics3dManager: Graphics3dManager) => {
        this.graphics3dManager = graphics3dManager;
    };

    setSocketManager = (socketManager: SocketManager) => {
        this.socketManager = socketManager;
    };
}