import * as React from "react";
import {useEffect} from "react";

import {configureNeuroglancerContainer} from "../../viewer/neuroglancer/neuroglancerViewer";

export type NeuroglancerContainerProps = {
    elementName: string
    width: number;
    height: number;
}

export const NeuroglancerContainer = (props: NeuroglancerContainerProps) => {
    useEffect(() => {
        configureNeuroglancerContainer(props.elementName);
    }, []);

    return <div id={props.elementName} style={{height: props.height, width: props.width}}/>
}
