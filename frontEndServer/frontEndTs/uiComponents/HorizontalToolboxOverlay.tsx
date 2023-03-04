import React, { Component } from 'react';
import NewBuildingButton from './NewBuildingButton';
import ResourcesBar from './ResourcesBar';

export interface ButtonEvents {
    onNewBuilding: () => void,
}

export default class HorizontalToolboxOverlay extends Component<ButtonEvents> {
    constructor(props: ButtonEvents) {
        super(props);
    }

    render() {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: 'space-between', width: "100vw", height: "100vh" }}>
                <div style={{ display: "flex", backgroundColor: "yellow", width: "auto", height: 50, justifyContent: 'center' }}>
                    <ResourcesBar />
                    <NewBuildingButton onNewBuilding={() => this.props.onNewBuilding()} />
                </div>
                <div style={{ display: "flex", backgroundColor: "yellow", width: "auto", height: 50 }}>
                    xd
                </div>
            </div>
        );
    }
}