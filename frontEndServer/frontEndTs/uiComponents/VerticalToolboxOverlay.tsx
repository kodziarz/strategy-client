import React, { Component, createRef } from 'react';
import Container from 'typedi';
import Graphics3dManager from '../Graphics3dManager';

export type VerticalToolboxOverlayProps = {
};

export default class VerticalToolboxOverlay extends Component<VerticalToolboxOverlayProps> {

    graphics3dManagerDivRef: React.RefObject<HTMLDivElement>;
    graphics3dManager: Graphics3dManager;

    constructor(props: VerticalToolboxOverlayProps) {
        super(props);
        this.graphics3dManagerDivRef = React.createRef();
    }

    componentDidMount(): void {
        this.graphics3dManager = Container.get(Graphics3dManager);
        this.graphics3dManager.setRootDiv(this.graphics3dManagerDivRef.current);
    }

    render() {
        return (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: 'space-between', width: "100vw", height: "100vh" }}>
                <div style={{ display: "flex", backgroundColor: "blue", flexGrow: 1 }}>
                    xd
                </div>
                <div style={{ display: "flex", flexDirection: "column", flexGrow: 25 }}>
                    <div style={{ display: "flex", flexGrow: 1, justifyContent: 'center' }}>
                    </div>
                    <div style={{ display: "flex", flexGrow: 25, position: "relative" }}>
                        <div ref={this.graphics3dManagerDivRef}
                            style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "auto" }}></div>
                    </div>
                    <div style={{ display: "flex", flexGrow: 1 }}>
                    </div>
                </div>
                <div style={{ display: "flex", backgroundColor: "blue", flexGrow: 1 }}>
                    xd
                </div>
            </div>
        );
    }
}