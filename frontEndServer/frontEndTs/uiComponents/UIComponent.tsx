import React from "react";
import Container from "typedi";
import Graphics3dManager from "../Graphics3dManager";
import SETTINGS from "../SETTINGS";
import Overlay from "./Overlay";
import ResourcesBar from "./ResourcesBar";

/**
 * Main UI Component.
 */
export default class UIComponent extends React.Component {

    private graphics3dManager: Graphics3dManager;

    constructor(props: {}) {
        super(props);
        this.state = {};
        this.graphics3dManager = Container.get(Graphics3dManager);
        window.addEventListener("mousemove", (e) => {
            const leftBorder = window.innerWidth * SETTINGS.cameraMovingScreenPart;
            const rightBorder = window.innerWidth * (1 - SETTINGS.cameraMovingScreenPart);
            const topBorder = window.innerHeight * SETTINGS.cameraMovingScreenPart;
            const bottomBorder = window.innerHeight * (1 - SETTINGS.cameraMovingScreenPart);

            //X velocity
            if (e.clientX < leftBorder)
                this.graphics3dManager.cameraXVelocity = (e.clientX - leftBorder) / leftBorder;
            else if (e.clientX > rightBorder)
                this.graphics3dManager.cameraXVelocity = (e.clientX - rightBorder) / leftBorder;
            else this.graphics3dManager.cameraXVelocity = 0;

            //Y velocity
            if (e.clientY < topBorder)
                this.graphics3dManager.cameraYVelocity = (topBorder - e.clientY) / topBorder;
            else if (e.clientY > bottomBorder)
                this.graphics3dManager.cameraYVelocity = (bottomBorder - e.clientY) / topBorder;
            else this.graphics3dManager.cameraYVelocity = 0;
        });

        window.addEventListener("mouseout", () => {
            this.graphics3dManager.cameraXVelocity = 0;
            this.graphics3dManager.cameraYVelocity = 0;
        });
    }



    render(): React.ReactNode {
        return (
            <div style={{ pointerEvents: "none", width: "100vw", height: "100vh", display: "flex" }}>
                <ResourcesBar />
            </div>
        );
    }
}