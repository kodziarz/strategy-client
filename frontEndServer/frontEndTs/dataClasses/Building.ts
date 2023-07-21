import BuildingsTypes from "./buildings/BuildingsTypes";
import { v4 as uuid } from "uuid";

/**Class to extend to create specific buildings */
export default abstract class Building {
    /**Enables front-end to differentiate Buildings. */
    type: BuildingsTypes;
    x: number;
    y: number;
    readonly width: number = 100;
    readonly length: number = 100;
    readonly id: string;

    constructor() {
        this.id = uuid();
    }
}