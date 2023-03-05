import React from "react";
import Container from "typedi";
import Graphics3dManager from "../Graphics3dManager";
import SETTINGS from "../SETTINGS";
import HorizontalToolboxOverlay from "./HorizontalToolboxOverlay";
import Overlay from "./Overlay";
import ResourcesBar from "./ResourcesBar";
import VerticalToolboxOverlay from "./VerticalToolboxOverlay";

/**
 * Main UI Component.
 */
export default class UIComponent extends React.Component {

    private graphics3dManager: Graphics3dManager;

    constructor(props: {}) {
        super(props);
        this.state = {};
        this.graphics3dManager = Container.get(Graphics3dManager);

        window.addEventListener('resize', this.graphics3dManager.resizeRenderer);
    }

    // Reacts on NewBuildingButton click, sends event to Graphics3dManager
    onNewBuilding = () => {
        // Sets Graphics3dManager 'state' on 'placing building'
        console.log('place a building');
    };

    render(): React.ReactNode {
        return (
            <div style={{ pointerEvents: "none", width: "100vw", height: "100vh" }}>
                <div style={{ position: "absolute", width: "100vw", height: "100vh" }}>
                    <HorizontalToolboxOverlay onNewBuilding={this.onNewBuilding} />
                </div>
                {/* <div style={{ position: "absolute", width: "100vw", height: "100vh" }}>
                    <VerticalToolboxOverlay />
                </div> */}
                {/* <div style={{ pointerEvents: "none", width: "100vw", height: "100vh", display: "flex" }}>
                    <ResourcesBar />
                </div> */}
            </div>
        );
    }
}