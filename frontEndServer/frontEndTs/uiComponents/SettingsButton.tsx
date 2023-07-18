import React, { Component } from 'react';

export interface ButtonEvents {
    onClick: () => void,
}

export default class SettingsButton extends Component<ButtonEvents> {
    constructor(props: ButtonEvents) {
        super(props);
    }
    render() {
        return (
            <div style={{ display: "inline-block", color: "white", pointerEvents: "auto", backgroundColor: "#123456" }}
                onClick={this.props.onClick}
            >
                otwórz se ustawienia
            </div >
        );
    }
}