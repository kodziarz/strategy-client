import Building from "../Building";
import BuildingTypes from "./BuildingsTypes";

export default class MainBuilding extends Building {
    type = BuildingTypes.MAIN;
    constructor(x: number, y: number) {
        super();
    }
}