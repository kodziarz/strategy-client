import React, { Component } from 'react';

export type FunctionalOverlayProps = {
    isVisible: boolean,
    function: string,
}

/**
 * Displays overlay containing setting, shop, resources etc...
 */
export default class FunctionalOverlay extends Component<FunctionalOverlayProps> {
    constructor(props: FunctionalOverlayProps) {
        super(props);
        console.log(props);
    }

    render() {
        return (
            <div style={{ position: "relative", width: "100%", height: "100%", visibility: this.props.isVisible ? 'visible' : 'hidden' }}>
                <div style={{ position: "absolute" }}>
                    {this.props.function == 'settings' ? <div>ustawienia</div> : ''}
                    {this.props.function == 'building' ? <div>sklep</div> : ''}
                    {this.props.function == 'resources' ? <div>zasoby</div> : ''}
                </div>
            </div>
        );
    }
}