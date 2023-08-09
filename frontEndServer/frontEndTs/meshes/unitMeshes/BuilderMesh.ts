import * as THREE from "three";
import Builder from "../../../../../strategy-common/dataClasses/units/Builder";
import UnitMesh from "../UnitMesh";
export default class BuilderMesh extends UnitMesh {

    // mainBuildingData: MainBuilding;
    constructor(builder: Builder) {
        const geometry = new THREE.BoxGeometry(
            builder.width,
            builder.length,
            4
        );
        const material = new THREE.MeshBasicMaterial({ color: 0x888888 });
        super(geometry, material, builder);
        this.height = geometry.parameters.depth;
        this.position.set(
            builder.x,
            builder.y,
            this.height / 2
        );

        // this.mainBuildingData = mainBuilding;
    }

    setOpponentsOwnership(): void {
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    }
}