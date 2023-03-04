import React, { Component } from 'react';
import Container from 'typedi';
import Graphics3dManager from '../Graphics3dManager';

export type MapMovingComponentProps = {
    style?: any;
    direction: "up" | "left" | "down" | "right";
};


export default class MapMovingComponent extends Component<MapMovingComponentProps> {

    graphics3dManager: Graphics3dManager = Container.get(Graphics3dManager);
    ref: React.RefObject<HTMLDivElement>;

    constructor(props: MapMovingComponentProps) {
        super(props);

        this.ref = React.createRef<HTMLDivElement>();
    }

    handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {


        switch (this.props.direction) {
            case "up":
                const topBorder = this.ref.current.offsetTop;
                const tDistance = this.ref.current.offsetHeight - (event.clientY - topBorder);
                this.graphics3dManager.cameraYVelocity = tDistance / this.ref.current.offsetHeight;
                break;
            case "left":
                const leftBorder = this.ref.current.offsetLeft;
                const lDistance = -(this.ref.current.offsetWidth - (event.clientX - leftBorder));
                this.graphics3dManager.cameraXVelocity = lDistance / this.ref.current.offsetWidth;
                break;
            case "down":
                const bottomBorder = this.ref.current.offsetTop + this.ref.current.offsetHeight;
                const bDistance = -(this.ref.current.offsetHeight - (bottomBorder - event.clientY));
                this.graphics3dManager.cameraYVelocity = bDistance / this.ref.current.offsetHeight;
                break;
            case "right":
                const rightBorder = this.ref.current.offsetLeft + this.ref.current.offsetWidth;
                const rDistance = this.ref.current.offsetWidth - (rightBorder - event.clientX);
                this.graphics3dManager.cameraXVelocity = rDistance / this.ref.current.offsetWidth;
                break;
        };
    };

    handleMouseOut = () => {
        switch (this.props.direction) {
            case "up":
            case "down":
                this.graphics3dManager.cameraYVelocity = 0;
                break;
            case "left":
            case "right":
                this.graphics3dManager.cameraXVelocity = 0;
                break;
        }
    };

    render() {
        return (
            <div ref={this.ref}
                style={this.props.style != undefined ? this.props.style : {}}
                onMouseMove={this.handleMouseMove}
                onMouseOut={this.handleMouseOut}>
            </div>
        );
    }
}