import React, { Component } from 'react';

export default class VerticalToolboxOverlay extends Component {
    render() {
        return (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: 'space-between', width: "100vw", height: "100vh" }}>
                <div style={{ display: "flex", backgroundColor: "blue", width: 50, height: "auto" }}>
                    xd
                </div>
                <div style={{ display: "flex", backgroundColor: "blue", width: 50, height: "auto" }}>
                    xd
                </div>
            </div>
        );
    }
}