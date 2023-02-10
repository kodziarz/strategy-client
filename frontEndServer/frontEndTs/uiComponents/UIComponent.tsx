import React from "react";
import ResourcesBar from "./ResourcesBar";

/**
 * Main UI Component.
 */
export default class UIComponent extends React.Component {
    constructor(props: {}) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        return (
            <div>
                <ResourcesBar />
            </div>
        )
    }
}