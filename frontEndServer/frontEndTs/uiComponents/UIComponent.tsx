import React from "react";
import Container from "typedi";
import Graphics3dManager from "../Graphics3dManager";
import SETTINGS from "../SETTINGS";
import ResourcesBar from "./ResourcesBar";
import NewBuildingButton from "./NewBuildingButton";
import MapMovingComponent from "./MapMovingComponent";
import UIInterface from "../UIInterface";
import MainBuilding from "../dataClasses/buildings/MainBuilding";
import FunctionalOverlay from "./FunctionalOverlay";
import SettingsButton from "./SettingsButton";


interface UIComponentState {
    isOverlayVisible: boolean,
    overlayFunction: 'building' | 'resources' | 'settings'; // 'settings' is default function
}

/**
 * Main UI Component.
 */
export default class UIComponent extends React.Component<{}, UIComponentState> {

    private threeJSDivRef: React.RefObject<HTMLDivElement>;
    private uiInterface: UIInterface;

    constructor(props: {}) {
        super(props);
        this.state = { isOverlayVisible: false, overlayFunction: 'settings' };
        this.threeJSDivRef = React.createRef();
        this.uiInterface = Container.get(UIInterface);
    }

    componentDidMount(): void {
        this.uiInterface.setGraphics3dManagerRootDiv(this.threeJSDivRef.current);
    }

    // Reacts on NewBuildingButton click, sends event to Graphics3dManager
    onNewBuilding = () => {
        // Sets Graphics3dManager 'state' on 'placing building'
        this.setState({ isOverlayVisible: !this.state.isOverlayVisible, overlayFunction: 'building' });
        console.log(this.state);
        console.log('place a building');
    };

    onNewBuildingSelected = (buildingName: string) => {

    };

    render(): React.ReactNode {
        return (
            <div style={{ pointerEvents: "none", width: "100vw", height: "100vh" }}>
                <div style={{ position: "absolute", width: "100vw", height: "100vh" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: 'space-between', width: "100vw", height: "100vh" }}>
                        <div style={{ display: "flex", backgroundColor: "yellow", flex: 1, justifyContent: 'center' }}>
                            <ResourcesBar />
                            <SettingsButton onClick={
                                async () => {
                                    this.setState({ overlayFunction: 'settings', isOverlayVisible: !this.state.isOverlayVisible });
                                }
                            } />
                            <NewBuildingButton onNewBuilding={
                                async () => {
                                    let mesh = await this.uiInterface.placeBuilding(new MainBuilding(0, 0));
                                }} />
                        </div>
                        <div style={{ display: "flex", flex: 25, flexDirection: "row" }}>
                            <div style={{ display: "flex", backgroundColor: "blue", flex: 1 }}>
                                lewy pasek
                            </div>
                            <div style={{ display: "flex", flexGrow: 25, position: "relative" }}>
                                <div ref={this.threeJSDivRef}
                                    style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "auto" }}>
                                </div>

                                <div
                                    style={{
                                        position: "absolute", width: "100%", height: "100%", pointerEvents: "none",
                                        display: "flex", flexDirection: "row", justifyContent: "space-between"
                                    }}>
                                    <MapMovingComponent direction="left" style={{ width: "5%", backgroundColor: "gray" }} />
                                    <MapMovingComponent direction="right" style={{ width: "5%", backgroundColor: "gray" }} />
                                </div>
                                <div
                                    style={{
                                        position: "absolute", width: "100%", height: "100%", pointerEvents: "none",
                                        display: "flex", flexDirection: "column", justifyContent: "space-between"
                                    }}>
                                    <MapMovingComponent direction="up" style={{ height: "5%", backgroundColor: "gray" }} />
                                    <MapMovingComponent direction="down" style={{ height: "5%", backgroundColor: "gray" }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', position: 'absolute', width: '100%', height: '100%' }}>
                                    <FunctionalOverlay function={this.state.overlayFunction} isVisible={this.state.isOverlayVisible} />
                                </div>
                            </div>
                            <div style={{ display: "flex", backgroundColor: "blue", flex: 1 }}>
                                prawy pasek
                            </div>
                        </div>
                        <div style={{ display: "flex", backgroundColor: "yellow", flex: 1 }}>
                            dolny pasek
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}