import React, { Component } from 'react';


export default class Overlay extends Component {

    children: React.ReactNode;

    constructor({ children }: { children: React.ReactNode; }) {
        super({ children });
        this.children = children;
    }

    render() {
        return (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <div style={{ position: "absolute" }}>
                    {this.children}
                </div>
            </div>
        );
    }
}