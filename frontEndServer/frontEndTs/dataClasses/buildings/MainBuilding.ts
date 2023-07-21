import Building from "../Building";
import BuildingTypes from "./BuildingsTypes";

export default class MainBuilding extends Building {

    public type = BuildingTypes.MAIN;

    constructor(
        public x: number,
        public y: number
    ) {
        super();
    }
}