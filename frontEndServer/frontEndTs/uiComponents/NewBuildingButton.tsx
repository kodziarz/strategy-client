import React, { Component } from 'react';

export interface ButtonEvents {
    onNewBuilding: () => void,
}

export default class NewBuildingButton extends Component<ButtonEvents> {
    constructor(props: ButtonEvents) {
        super(props);
    }
    render() {
        return (
            <div style={{ display: "inline-block", color: "white", pointerEvents: "auto", backgroundColor: "pink" }}
                onClick={this.props.onNewBuilding}
            >
                walnij se domek
            </div >
        );
    }
}