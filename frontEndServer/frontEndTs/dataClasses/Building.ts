import BuildingsTypes from "./buildings/BuildingsTypes";

/**Class to extend to create specific buildings */
export default abstract class Building {
    /**Enables front-end to differentiate Buildings. */
    type: BuildingsTypes;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly length: number;
    readonly id: string;
}