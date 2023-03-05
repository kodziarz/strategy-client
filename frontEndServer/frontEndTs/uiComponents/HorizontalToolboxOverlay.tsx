import React, { Component } from 'react';
import Container from 'typedi';
import Graphics3dManager from '../Graphics3dManager';
import MapMovingComponent from './MapMovingComponent';
import NewBuildingButton from './NewBuildingButton';
import ResourcesBar from './ResourcesBar';

export interface ButtonEvents {
    onNewBuilding: () => void,
}

export default class HorizontalToolboxOverlay extends Component<ButtonEvents> {

    graphics3dManagerDivRef: React.RefObject<HTMLDivElement>;
    graphics3dManager: Graphics3dManager;

    constructor(props: ButtonEvents) {
        super(props);
        this.graphics3dManagerDivRef = React.createRef();
    }

    componentDidMount(): void {
        this.graphics3dManager = Container.get(Graphics3dManager);
        this.graphics3dManager.setRootDiv(this.graphics3dManagerDivRef.current);
    }

    render() {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: 'space-between', width: "100vw", height: "100vh" }}>
                <div style={{ display: "flex", backgroundColor: "yellow", flex: 1, justifyContent: 'center' }}>
                    <ResourcesBar />
                    <NewBuildingButton onNewBuilding={() => this.props.onNewBuilding()} />
                </div>
                <div style={{ display: "flex", flex: 25, flexDirection: "row" }}>
                    <div style={{ display: "flex", backgroundColor: "blue", flex: 1 }}>
                        xd
                    </div>
                    <div style={{ display: "flex", flexGrow: 25, position: "relative" }}>
                        <div ref={this.graphics3dManagerDivRef}
                            style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "auto" }}></div>
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
                    </div>
                    <div style={{ display: "flex", backgroundColor: "blue", flex: 1 }}>
                        xd
                    </div>
                </div>
                <div style={{ display: "flex", backgroundColor: "yellow", flex: 1 }}>
                    xd
                </div>
            </div>
        );
    }
}