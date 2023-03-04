import React, { Component } from 'react';


export default class ResourcesBar extends Component {
    render() {
        return (
            <div style={{ display: "inline-block", color: "white", pointerEvents: "auto" }}>
                <div style={{ color: "white", display: "inline-block", marginRight: 20 }}
                    onClick={() => { console.log("kliknięto"); }}>zasob1</div>
                <div style={{ color: "white", display: "inline-block", marginRight: 20 }}>zasob2</div>
                <div style={{ color: "white", display: "inline-block", marginRight: 20 }}>zasob3</div>
            </div>
        );
    }
}