import { Service } from "typedi";
import MapField from "../../../../strategy-common/dataClasses/MapField";
import Unit from "../../../../strategy-common/dataClasses/Unit";
import Movement from "../../../../strategy-common/geometryClasses/Movement";
import FullPath from "../FullPath";
import UnitMesh from "../meshes/UnitMesh";
import Path from "./../../../../strategy-common/geometryClasses/Path";
import { getMapFieldsOfUnit, moveUnitByDeltaTime } from "./../../../../strategy-common/mapService";
import MapFieldPlaceholder from "../socketManager/MapFieldPlaceholder";
import ReportUnitMoveMessage from "../../../../strategy-common/socketioMessagesClasses/ReportUnitMoveMessage";

@Service()
export default class UnitMover {
    private fullPaths: FullPath[] = [];
    private movements: Movement[] = [];
    private fieldsMap: (MapField | MapFieldPlaceholder)[][];
    private unitMeshes: UnitMesh[];

    constructor() { }

    /**
     * Starts movement by given parameters.
     * @param id Id of set movement.
     * @param unit Moved unit.
     * @param fullPath Full path of the unit (including
     * {@link MapFieldPlaceholder}s).
     * @param start Unix time of start.
     */
    setMovement = (id: string, unit: Unit, fullPath: FullPath, start: number) => {
        this.fullPaths.push(fullPath);

        this.movements.push({
            id,
            unit,
            nextPointIndex: 0,
            path: fullPath.supplyKnockaboutPath(new Path()),
            start,
            lastTimestamp: start
        });
    };

    /**
     * Moves unit.
     * @param currentUnixTime Unix time of the moment, to which the movement
     * needs to be performed.
     */
    moveUnits = (currentUnixTime: number): void => {
        this.movements.forEach((movement, movementIndex) => {
            this.moveUnit(movement, movementIndex, currentUnixTime);
        });
    };

    /**
     * Moves Unit.
     * @param movement Movement data.
     * @param movementIndex Index of movement in {@link movements} array.
     * @param currentUnixTime Unix time of the moment, to which the movement
     * needs to be performed.
     */
    moveUnit = (movement: Movement, movementIndex: number, currentUnixTime: number) => {
        //DEV finding unit mesh can be much optimized (e.g. some additioal Map unit -> unitMesh)!!
        let unitMesh = this.unitMeshes.find((mesh) => { return mesh.unitData.id == movement.unit.id; });

        while (true) {
            let remainingTime = moveUnitByDeltaTime(
                movement,
                (currentUnixTime - movement.lastTimestamp) / 1000,
                currentUnixTime
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

            if (remainingTime > 0) {
                let fullPath = this.fullPaths[movementIndex];
                if (movement.path.points.length == fullPath.points.length) {
                    console.log("Jendostka dotarła do szczęśliwego końca");
                    this.movements.splice(movementIndex, 1);
                    this.fullPaths.splice(movementIndex, 1);
                    break;
                } else {
                    //it is not the end yet, because there are some
                    //MapFieldPlaceHolders ahead.
                    movement.lastTimestamp = currentUnixTime - remainingTime * 1000;
                    movement.path = fullPath.supplyKnockaboutPath(movement.path);
                    //and the loop continues
                }
            } else {
                // console.log("Jednostka kontynuuje podróż.");
                movement.lastTimestamp = currentUnixTime;
                break;
            }
        }
    };

    /**
     * Moves unit by given time and removes its movement from list (stops it).
     * @param unit Moving unit.
     * @param currentTimestamp Unix time of the moment, to which the movement
     * needs to be performed.
     */
    finishMovementOfUnit = (unit: Unit, currentTimestamp: number) => {
        let ongoingMovement: Movement = null;
        let ongoingMovementIndex: number;
        for (let i = 0; i < this.movements.length; i++) {
            const checkedMovement = this.movements[i];
            if (checkedMovement.unit.id == unit.id) {
                ongoingMovement = checkedMovement;
                ongoingMovementIndex = i;
                break;
            }
        }
        if (ongoingMovement) {
            this.movements.splice(ongoingMovementIndex, 1);
            // server sends movement report just before changing the trace of unit
            // so the unit does not need to be additionally moved.
        }
    };

    /**
     * Updates movement data by data received from server.
     * @param movementReport Data from server about actual position of unit at
     * specific moment.
     */
    updateMovement = (movementReport: ReportUnitMoveMessage) => {
        let movement = this.movements.find((checkedMovement) => { return checkedMovement.id == movementReport.movementId; });
        if (!movement) {
            throw new Error("Movement with such an id does not exist.");
        }

        movement.lastTimestamp = movementReport.timestamp;
        movement.nextPointIndex = movementReport.nextPointIndex;
        movement.unit.x = movementReport.position.x;
        movement.unit.y = movementReport.position.y;

        //DEV should be deleted
        // let unitMesh = this.unitMeshes.find((mesh) => { return mesh.unitData.id == movement.unit.id; });
        // unitMesh.position.x = movementReport.position.x;
        // unitMesh.position.y = movementReport.position.y;
    };

    setFieldsMap = (fieldsMap: (MapField | MapFieldPlaceholder)[][]) => {
        this.fieldsMap = fieldsMap;
    };

    setUnitMeshes = (unitMeshes: UnitMesh[]) => {
        this.unitMeshes = unitMeshes;
    };

}