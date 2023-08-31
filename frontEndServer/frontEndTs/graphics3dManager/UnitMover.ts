import { Service } from "typedi";
import MapField from "../../../../strategy-common/dataClasses/MapField";
import Unit from "../../../../strategy-common/dataClasses/Unit";
import Movement from "../../../../strategy-common/geometryClasses/Movement";
import FullPath from "../FullPath";
import UnitMesh from "../meshes/UnitMesh";
import Path from "./../../../../strategy-common/geometryClasses/Path";
import { getMapFieldsOfUnit, moveUnitByDeltaTime } from "./../../../../strategy-common/mapService";
import MapFieldPlaceholder from "../socketManager/MapFieldPlaceholder";

@Service()
export default class UnitMover {
    private fullPaths: FullPath[] = [];
    private movements: Movement[] = [];
    private fieldsMap: (MapField | MapFieldPlaceholder)[][];
    private unitMeshes: UnitMesh[];

    constructor() { }

    setMovement = (id: string, unit: Unit, fullPath: FullPath, start: number) => {
        this.fullPaths.push(fullPath);
        console.log("fullPath: ", fullPath);

        this.movements.push({
            id,
            unit,
            nextPointIndex: 0,
            path: fullPath.supplyKnockaboutPath(new Path()),
            start,
            lastTimestamp: start
        });
    };

    move = (intervenedTime: number, deltaTime: number, currentUnixTime: number): void => {
        this.movements.forEach((movement, movementIndex) => {
            //DEV finding unit mesh can be much optimized (e.g. some additioal Map unit -> unitMesh)!!
            let unitMesh = this.unitMeshes.find((mesh) => { return mesh.unitData.id == movement.unit.id; });

            while (true) {
                let remainingTime = moveUnitByDeltaTime(
                    movement,
                    deltaTime
                );
                movement.unit.occupiedFields.length = 0;
                let occupiedFields = getMapFieldsOfUnit(movement.unit, this.fieldsMap);
                occupiedFields.forEach((field) => {
                    if (field instanceof MapFieldPlaceholder) {
                        field.addConnectedUnit(movement.unit);
                    } else {
                        movement.unit.occupiedFields.push(field);
                    }
                });
                unitMesh.position.x = movement.unit.x;
                unitMesh.position.y = movement.unit.y;

                if (remainingTime >= 0) {
                    let fullPath = this.fullPaths[movementIndex];
                    if (movement.path.points.length == fullPath.points.length) {
                        console.log("Jendostka dotarła do szczęśliwego końca");
                        this.movements.splice(movementIndex, 1);
                        this.fullPaths.splice(movementIndex, 1);
                        break;
                    } else {
                        //it is not the end yet, because there are some
                        //MapFieldPlaceHolders ahead.
                        fullPath.supplyKnockaboutPath(movement.path);
                        //and the loop continues
                    }
                } else {
                    console.log("Jednostka kontynuuje podróż.");
                    break;
                }
            }
        });
    };

    setFieldsMap = (fieldsMap: (MapField | MapFieldPlaceholder)[][]) => {
        this.fieldsMap = fieldsMap;
    };

    setUnitMeshes = (unitMeshes: UnitMesh[]) => {
        this.unitMeshes = unitMeshes;
    };

}