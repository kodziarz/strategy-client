import MapField from "../../../strategy-common/dataClasses/MapField";
import Path from "../../../strategy-common/geometryClasses/Path";
import Point2d from "../../../strategy-common/geometryClasses/Point2d";
import MapFieldPlaceholder, { MapFieldHolder } from "./socketManager/MapFieldPlaceholder";

export default class FullPath implements MapFieldHolder {

    /**Map Fields crossed between {@link points}. */
    mapFields: (MapField | MapFieldPlaceholder)[];
    /**
     * Includes all points of path, all crossings between crossed map fields,
     * but without beginning of the path (current unit position).
     */
    points: Point2d[];

    constructor(
        /**Map Fields crossed between {@link points}. */
        mapFields: MapField[],
        /**
         * Includes all points of path, all crossings between crossed map fields,
         * but without beginning of the path (current unit position).
         */
        points: Point2d[]
    );
    constructor();

    constructor(
        mapFields?: (MapField | MapFieldPlaceholder)[],
        points?: Point2d[]
    ) {
        if (points != undefined && mapFields != undefined) {
            // if the first constructor is used
            if (points.length != mapFields.length) {
                throw new Error("Path points number needs to be equal to map fields number.");
            }
            this.mapFields = mapFields;
            this.points = points;
        } else {
            // if the second constructor is used
            this.mapFields = [];
            this.points = [];
        }
    }

    replaceMapFieldPlaceHolder = (placeHolder: MapFieldPlaceholder, actualMapField: MapField): void => {
        for (let i = 0; i < this.mapFields.length; i++) {
            let field = this.mapFields[i];
            if (field == placeHolder) {
                this.mapFields[i] = actualMapField;
                break;
            }
        }
    };

    /**
     * Adds to given {@link knockaboutPath} all subsequent {@link MapField}s
     * until the first {@link MapFieldHolder} occurs on the {@link FullPath}.
     * @param knockaboutPath Path, which may contain only {@link MapField}s.
     * @returns Modified given {@link knockaboutPath}.
     */
    supplyKnockaboutPath(knockaboutPath: Path): Path {
        for (let i = knockaboutPath.mapFields.length; i < this.mapFields.length; i++) {
            let newMapField = this.mapFields[i];
            if (newMapField instanceof MapField) {
                knockaboutPath.mapFields.push(newMapField);
                knockaboutPath.points.push(this.points[i]);
            } else return;
        }
        return knockaboutPath;
    }
}