import React from "react";
import ReactDOM from "react-dom/client";
import { Service } from "typedi";
// import SomeComponent from "./SomeComponent";
import UIComponent from "./uiComponents/UIComponent";

/**
 * Displays {@link UIComponent}, where all the User Interface is rendered.
 */
@Service()
export default class UIManager {
    private rootDiv: HTMLDivElement;
    private reactRootComponent: ReactDOM.Root;

    constructor() {
        this.rootDiv = document.getElementById("uiDiv") as HTMLDivElement;

        this.reactRootComponent = ReactDOM.createRoot(this.rootDiv);
        this.reactRootComponent.render(
            <UIComponent />
        )
    }
}